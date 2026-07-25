import { useEffect, useRef, useState } from 'react';
import {
    addRecentAddress,
    makeRouteAlternative,
    normalizeRecentAddresses,
    resolveDeliveryZone
} from './utils/mapHelpers';

const ORIGIN_ADDRESS = 'Киров, Коммунальная улица, 5';
const KIROV_CENTER = [49.605433, 58.565190];
const KIROV_REGION_BOUNDS = [[46.1, 55.8], [54.2, 61.3]];
const RECENT_ADDRESSES_KEY = 'route_recent_addresses';
const YMAPS_TIMEOUT_MS = 12000;

export let routeMapController = null;

function loadRecentAddresses() {
    try {
        return normalizeRecentAddresses(
            JSON.parse(localStorage.getItem(RECENT_ADDRESSES_KEY) || '[]')
        );
    } catch {
        return [];
    }
}

function waitForYmaps(timeoutMs = YMAPS_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();

        const check = () => {
            if (window.ymaps?.ready) {
                window.ymaps.ready(() => resolve(window.ymaps));
                return;
            }

            if (Date.now() - startedAt >= timeoutMs) {
                reject(new Error('Yandex Maps API timeout'));
                return;
            }

            window.setTimeout(check, 100);
        };

        check();
    });
}

function getGeocodeAddress(geoObject, fallback = '') {
    if (!geoObject) return fallback;

    return (
        geoObject.getAddressLine?.() ||
        geoObject.properties?.get('text') ||
        geoObject.properties?.get('name') ||
        fallback
    );
}

function Test({
    setDistance,
    setDuration,
    setRegion,
    setAddress,
    setMapDistance,
    setRegions
}) {
    const searchInputRef = useRef(null);
    const queryRef = useRef('');
    const callbacksRef = useRef({
        setDistance,
        setDuration,
        setRegion,
        setAddress,
        setMapDistance,
        setRegions
    });
    const controllerRef = useRef(null);
    const [mapAttempt, setMapAttempt] = useState(0);
    const [query, setQuery] = useState('');
    const [mapStatus, setMapStatus] = useState('loading');
    const [routeStatus, setRouteStatus] = useState('idle');
    const [zonesStatus, setZonesStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [zoneWarning, setZoneWarning] = useState('');
    const [zoneLegend, setZoneLegend] = useState([]);
    const [activeZones, setActiveZones] = useState([]);
    const [zonesVisible, setZonesVisible] = useState(true);
    const [routeAlternatives, setRouteAlternatives] = useState([]);
    const [recentAddresses, setRecentAddresses] = useState(loadRecentAddresses);
    const [suggestionsSuppressed, setSuggestionsSuppressed] = useState(false);

    callbacksRef.current = {
        setDistance,
        setDuration,
        setRegion,
        setAddress,
        setMapDistance,
        setRegions
    };
    queryRef.current = query;

    const persistRecentAddress = (entry) => {
        setRecentAddresses((current) => {
            const next = addRecentAddress(current, entry);

            try {
                localStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(next));
            } catch {
                // The route remains usable when browser storage is unavailable.
            }

            return next;
        });
    };

    useEffect(() => {
        let disposed = false;
        let ymapsApi = null;
        let map = null;
        let multiRoute = null;
        let destinationMarker = null;
        let originMarker = null;
        let deliveryZones = null;
        let suggestView = null;
        let zonesVisibleValue = true;
        let lastDestination = null;
        let zonesPromise = Promise.resolve(null);
        let zoneAbortController = null;
        let routeRequestTimer = null;
        let locationRequestId = 0;
        const routesWithClickHandler = new WeakSet();

        const closeSuggestions = () => {
            setSuggestionsSuppressed(true);
            searchInputRef.current?.blur();

            const closePanel = () => {
                if (!disposed) {
                    suggestView?.state.set('panelClosed', true);
                }
            };

            closePanel();
            window.setTimeout(closePanel, 0);
        };

        const setQuerySilently = (address) => {
            setQuery(address);
            closeSuggestions();
        };

        const clearRouteValues = () => {
            const callbacks = callbacksRef.current;
            callbacks.setDistance(0);
            callbacks.setDuration(0);
            callbacks.setRegion('');
            callbacks.setAddress('');
            callbacks.setMapDistance(0);
            callbacks.setRegions([]);
        };

        const removeZones = () => {
            if (!deliveryZones || !map) return;

            if (typeof deliveryZones.removeFromMap === 'function') {
                deliveryZones.removeFromMap(map);
            } else {
                deliveryZones.each((zone) => map.geoObjects.remove(zone));
            }

            deliveryZones = null;
        };

        const setZoneVisibility = (visible) => {
            zonesVisibleValue = visible;
            setZonesVisible(visible);
            deliveryZones?.each((zone) => zone.options.set('visible', visible));
        };

        const loadZones = async () => {
            zoneAbortController?.abort();
            zoneAbortController = new AbortController();
            const abortController = zoneAbortController;
            const timeout = window.setTimeout(() => abortController.abort(), 10000);
            setZonesStatus('loading');
            setZoneWarning('');

            try {
                const response = await fetch('./data.geojson', {
                    cache: 'no-store',
                    signal: abortController.signal
                });
                if (!response.ok) {
                    throw new Error(`GeoJSON request failed: ${response.status}`);
                }

                const data = await response.json();
                if (disposed || !map || !ymapsApi) return null;

                removeZones();
                deliveryZones = ymapsApi.geoQuery(data).addToMap(map);
                deliveryZones.each((zone) => {
                    zone.options.set({
                        fillColor: zone.properties.get('fill'),
                        fillOpacity: zone.properties.get('fill-opacity'),
                        strokeColor: zone.properties.get('stroke'),
                        strokeWidth: zone.properties.get('stroke-width'),
                        strokeOpacity: zone.properties.get('stroke-opacity'),
                        interactivityModel: 'default#transparent',
                        cursor: 'crosshair',
                        visible: zonesVisibleValue
                    });
                });

                const legend = [];
                const seen = new Set();
                for (const feature of data.features || []) {
                    const description = feature?.properties?.description;
                    if (!description || seen.has(description)) continue;
                    seen.add(description);
                    legend.push({
                        name: description,
                        color: feature.properties.fill || feature.properties.stroke || '#7cae9d'
                    });
                }

                setZoneLegend(legend);
                setZonesStatus('ready');
                return deliveryZones;
            } catch (error) {
                if (disposed) return null;
                if (
                    abortController.signal.aborted &&
                    zoneAbortController !== abortController
                ) {
                    return null;
                }
                console.error('Failed to load delivery zones:', error);
                setZonesStatus('error');
                setZoneWarning('Тарифные зоны не загрузились. Маршрут можно построить, но район лучше проверить.');
                return null;
            } finally {
                window.clearTimeout(timeout);
                if (zoneAbortController === abortController) {
                    zoneAbortController = null;
                }
            }
        };

        const clearZoneHighlight = () => {
            deliveryZones?.each((zone) => {
                zone.options.set({
                    fillOpacity: zone.properties.get('fill-opacity'),
                    strokeWidth: zone.properties.get('stroke-width')
                });
            });
        };

        const resolveZoneForCoordinates = (coords) => {
            const descriptions = [];

            if (deliveryZones) {
                clearZoneHighlight();
                const polygons = deliveryZones.searchContaining(coords);
                polygons.each((polygon) => {
                    const description = polygon.properties.get('description');
                    if (description) descriptions.push(description);
                    polygon.options.set({
                        fillOpacity: Math.max(
                            Number(polygon.properties.get('fill-opacity')) || 0,
                            0.42
                        ),
                        strokeWidth: 3
                    });
                });
            }

            const zoneResult = resolveDeliveryZone(descriptions);
            const callbacks = callbacksRef.current;
            callbacks.setRegion(zoneResult.region);
            callbacks.setRegions(zoneResult.regions);
            setActiveZones(zoneResult.activeZones);
            return zoneResult;
        };

        const updateAlternatives = (selectedRoute = null) => {
            if (!multiRoute) {
                setRouteAlternatives([]);
                return;
            }

            const activeRoute = selectedRoute || multiRoute.getActiveRoute();
            const alternatives = [];
            multiRoute.getRoutes().each((route, index) => {
                alternatives.push(makeRouteAlternative(index, route, activeRoute));
                if (!routesWithClickHandler.has(route)) {
                    routesWithClickHandler.add(route);
                    route.events.add('click', () => {
                        window.setTimeout(() => {
                            if (!disposed) applyActiveRoute(route);
                        }, 0);
                    });
                }
            });
            setRouteAlternatives(alternatives);
        };

        const selectAlternative = (routeIndex) => {
            const route = multiRoute?.getRoutes().get(routeIndex);
            if (!route) return;

            multiRoute.setActiveRoute(route);
            applyActiveRoute(route);
        };

        const applyActiveRoute = async (selectedRoute = null) => {
            if (!multiRoute || !lastDestination) return;

            const activeRoute = selectedRoute || multiRoute.getActiveRoute();
            const destination = lastDestination;
            if (!activeRoute) {
                setRouteStatus('error');
                setErrorMessage('Маршрут не найден. Уточните адрес или выберите другую точку.');
                return;
            }

            await zonesPromise;
            if (
                disposed ||
                !multiRoute ||
                !lastDestination ||
                lastDestination !== destination
            ) {
                return;
            }

            const distance = activeRoute.properties.get('distance');
            const duration = activeRoute.properties.get('duration');
            const callbacks = callbacksRef.current;
            callbacks.setDistance(distance?.value || 0);
            callbacks.setMapDistance(distance?.value || 0);
            callbacks.setDuration(duration?.value || 0);
            callbacks.setAddress(destination.address);
            resolveZoneForCoordinates(destination.coords);
            updateAlternatives(activeRoute);
            persistRecentAddress(destination);
            setRouteStatus('ready');
            setErrorMessage('');
        };

        const createRoute = (destination) => {
            lastDestination = destination;
            destinationMarker.geometry.setCoordinates(destination.coords);
            destinationMarker.properties.set({
                iconCaption: 'Адрес доставки',
                balloonContent: destination.address
            });
            destinationMarker.options.set('visible', true);

            if (!multiRoute) {
                multiRoute = new ymapsApi.multiRouter.MultiRoute({
                    referencePoints: [ORIGIN_ADDRESS, destination.coords],
                    params: {
                        routingMode: 'auto',
                        results: 3,
                        reverseGeocoding: true
                    }
                }, {
                    boundsAutoApply: true,
                    wayPointVisible: false,
                    routeActiveStrokeColor: '#176c54',
                    routeActiveStrokeWidth: 6,
                    routeStrokeColor: '#8da29a',
                    routeStrokeWidth: 4,
                    routeActivePedestrianSegmentStrokeStyle: 'solid'
                });

                multiRoute.model.events.add('requestsend', () => {
                    if (disposed) return;
                    window.clearTimeout(routeRequestTimer);
                    routeRequestTimer = window.setTimeout(() => {
                        if (disposed) return;
                        setRouteStatus('error');
                        setErrorMessage('Маршрут строится слишком долго. Попробуйте ещё раз.');
                    }, 20000);
                    setRouteStatus('routing');
                    setErrorMessage('');
                });
                multiRoute.model.events.add('requestsuccess', () => {
                    window.clearTimeout(routeRequestTimer);
                    if (!disposed) applyActiveRoute();
                });
                multiRoute.model.events.add('requestfail', () => {
                    if (disposed) return;
                    window.clearTimeout(routeRequestTimer);
                    setRouteStatus('error');
                    setErrorMessage('Не удалось построить маршрут. Проверьте адрес и повторите попытку.');
                });
                multiRoute.events.add('boundschange', () => {
                    if (!disposed && multiRoute.getBounds()) {
                        map.setBounds(multiRoute.getBounds(), {
                            checkZoomRange: true,
                            zoomMargin: 34
                        });
                    }
                });
                map.geoObjects.add(multiRoute);
            } else {
                multiRoute.model.setReferencePoints([ORIGIN_ADDRESS, destination.coords]);
            }
        };

        const reverseGeocodeAndRoute = async (coords) => {
            const requestId = ++locationRequestId;
            closeSuggestions();
            setRouteStatus('geocoding');
            setErrorMessage('');

            try {
                const result = await ymapsApi.geocode(coords, {
                    results: 1,
                    kind: 'house'
                });
                if (disposed || requestId !== locationRequestId) return;

                const geoObject = result.geoObjects.get(0);
                const address = getGeocodeAddress(geoObject, 'Выбранная точка на карте');
                setQuerySilently(address);
                createRoute({ address, coords });
            } catch (error) {
                if (disposed) return;
                console.error('Reverse geocoding failed:', error);
                setRouteStatus('error');
                setErrorMessage('Не удалось определить адрес точки. Попробуйте выбрать её ещё раз.');
            }
        };

        const searchAndRoute = async (request, knownCoords = null) => {
            const normalizedRequest = request?.trim();
            if (!normalizedRequest && !knownCoords) return;
            const requestId = ++locationRequestId;
            closeSuggestions();

            if (knownCoords) {
                setQuerySilently(normalizedRequest);
                createRoute({ address: normalizedRequest, coords: knownCoords });
                return;
            }

            setRouteStatus('geocoding');
            setErrorMessage('');

            try {
                const result = await ymapsApi.geocode(normalizedRequest, {
                    results: 1,
                    boundedBy: KIROV_REGION_BOUNDS
                });
                if (disposed || requestId !== locationRequestId) return;

                const geoObject = result.geoObjects.get(0);
                if (!geoObject) {
                    throw new Error('Address not found');
                }

                const coords = geoObject.geometry.getCoordinates();
                const address = getGeocodeAddress(geoObject, normalizedRequest);
                setQuerySilently(address);
                createRoute({ address, coords });
            } catch (error) {
                if (disposed) return;
                console.error('Address geocoding failed:', error);
                setRouteStatus('error');
                setErrorMessage('Адрес не найден. Добавьте город, улицу и номер дома.');
            }
        };

        const resetMap = () => {
            locationRequestId += 1;
            if (multiRoute && map) {
                map.geoObjects.remove(multiRoute);
                multiRoute = null;
            }
            lastDestination = null;
            destinationMarker?.options.set('visible', false);
            setQuery('');
            closeSuggestions();
            setRouteStatus('idle');
            setRouteAlternatives([]);
            setActiveZones([]);
            clearZoneHighlight();
            setErrorMessage('');
            clearRouteValues();
            map?.setCenter(KIROV_CENTER, 12, { checkZoomRange: true });
        };

        const retryRoute = () => {
            if (lastDestination) {
                if (multiRoute && map) {
                    map.geoObjects.remove(multiRoute);
                    multiRoute = null;
                }
                createRoute(lastDestination);
            } else if (queryRef.current.trim()) {
                searchAndRoute(queryRef.current);
            }
        };

        const initializeMap = async () => {
            setMapStatus('loading');
            setRouteStatus('idle');
            setErrorMessage('');

            try {
                ymapsApi = await waitForYmaps();
                if (disposed) return;

                map = new ymapsApi.Map('map', {
                    center: KIROV_CENTER,
                    zoom: 12,
                    controls: []
                }, {
                    yandexMapDisablePoiInteractivity: true
                });

                const zoomControl = new ymapsApi.control.ZoomControl({
                    options: {
                        size: 'small',
                        float: 'none',
                        position: { bottom: 18, right: 12 }
                    }
                });
                map.controls.add(zoomControl);

                destinationMarker = new ymapsApi.Placemark(
                    KIROV_CENTER,
                    { iconCaption: 'Адрес доставки' },
                    {
                        preset: 'islands#darkGreenDotIconWithCaption',
                        draggable: true,
                        visible: false,
                        iconCaptionMaxWidth: 190
                    }
                );
                destinationMarker.events.add('dragend', () => {
                    const coords = destinationMarker.geometry.getCoordinates();
                    reverseGeocodeAndRoute(coords);
                });
                map.geoObjects.add(destinationMarker);

                map.events.add('click', (event) => {
                    const coords = event.get('coords');
                    if (coords) reverseGeocodeAndRoute(coords);
                });

                try {
                    const originResult = await ymapsApi.geocode(ORIGIN_ADDRESS, { results: 1 });
                    if (!disposed) {
                        const originGeoObject = originResult.geoObjects.get(0);
                        if (originGeoObject) {
                            originMarker = new ymapsApi.Placemark(
                                originGeoObject.geometry.getCoordinates(),
                                {
                                    iconCaption: 'Химторг',
                                    balloonContent: ORIGIN_ADDRESS
                                },
                                {
                                    preset: 'islands#grayDotIconWithCaption',
                                    iconCaptionMaxWidth: 120
                                }
                            );
                            map.geoObjects.add(originMarker);
                        }
                    }
                } catch (error) {
                    console.warn('Origin geocoding failed:', error);
                }

                if (searchInputRef.current) {
                    suggestView = new ymapsApi.SuggestView(searchInputRef.current, {
                        results: 5,
                        boundedBy: KIROV_REGION_BOUNDS,
                        zIndex: 100000
                    });
                    suggestView.events.add('select', (event) => {
                        const item = event.get('item');
                        if (item?.value) {
                            setQuery(item.value);
                            searchAndRoute(item.value);
                        }
                    });
                }

                zonesPromise = loadZones();
                controllerRef.current = {
                    search: searchAndRoute,
                    reset: resetMap,
                    retry: retryRoute,
                    retryZones: async () => {
                        zonesPromise = loadZones();
                        const zones = await zonesPromise;
                        if (zones && lastDestination) {
                            resolveZoneForCoordinates(lastDestination.coords);
                        }
                        return zones;
                    },
                    setZonesVisible: setZoneVisibility,
                    selectAlternative
                };
                routeMapController = controllerRef.current;
                setMapStatus('ready');
            } catch (error) {
                if (disposed) return;
                console.error('Map initialization failed:', error);
                setMapStatus('error');
                setErrorMessage('Карта не загрузилась. Проверьте соединение и повторите попытку.');
            }
        };

        initializeMap();

        return () => {
            disposed = true;
            if (routeMapController === controllerRef.current) {
                routeMapController = null;
            }
            controllerRef.current = null;
            window.clearTimeout(routeRequestTimer);
            zoneAbortController?.abort();
            suggestView?.destroy();
            removeZones();
            map?.destroy();
        };
    }, [mapAttempt]);

    const submitSearch = (event) => {
        event.preventDefault();
        controllerRef.current?.search(query);
    };

    const routeStatusLabel = {
        idle: 'Выберите адрес',
        geocoding: 'Определяем адрес…',
        routing: 'Строим маршрут…',
        ready: 'Маршрут готов',
        error: 'Нужна ваша помощь'
    }[routeStatus];

    return (
        <div className="route-map-experience">
            <div className="route-map-search-panel">
                <form className="route-map-search" onSubmit={submitSearch}>
                    <label htmlFor="route-address-search">Адрес доставки</label>
                    <div className="route-map-search-row">
                        <div className={`route-map-search-input ${suggestionsSuppressed ? 'is-suppressed' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"/>
                                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                            <input
                                ref={searchInputRef}
                                id="route-address-search"
                                value={query}
                                onFocus={() => setSuggestionsSuppressed(false)}
                                onChange={(event) => {
                                    setSuggestionsSuppressed(false);
                                    setQuery(event.target.value);
                                }}
                                placeholder="Кировская область: город, улица, дом"
                                autoComplete="off"
                            />
                        </div>
                        <button
                            type="submit"
                            className="route-map-primary-action"
                            disabled={mapStatus !== 'ready' || !query.trim()}
                        >
                            Построить
                        </button>
                    </div>
                </form>

                {recentAddresses.length > 0 && (
                    <div className="route-map-search-meta">
                        <div className="route-map-recents" aria-label="Недавние адреса">
                            <strong>Недавние:</strong>
                            {recentAddresses.map((item) => (
                                <button
                                    key={`${item.address}-${item.coords.join('-')}`}
                                    type="button"
                                    title={item.address}
                                    onClick={() => controllerRef.current?.search(item.address, item.coords)}
                                >
                                    {item.address}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="route-map-viewport">
                <div className="route-map-surface" id="map" />

                {mapStatus === 'loading' && (
                    <div className="route-map-state-overlay" role="status">
                        <span className="route-map-spinner" />
                        <strong>Загружаем карту</strong>
                        <span>Подключаем геокодер и тарифные зоны.</span>
                    </div>
                )}

                {mapStatus === 'error' && (
                    <div className="route-map-state-overlay is-error" role="alert">
                        <strong>Карта недоступна</strong>
                        <span>{errorMessage}</span>
                        <button type="button" onClick={() => setMapAttempt((attempt) => attempt + 1)}>
                            Повторить
                        </button>
                    </div>
                )}

                {mapStatus === 'ready' && (
                    <>
                        <div className={`route-map-route-status is-${routeStatus}`} aria-live="polite">
                            <span />
                            {routeStatusLabel}
                        </div>

                        <div className="route-map-legend">
                            <div className="route-map-legend-header">
                                <strong>Тарифные зоны</strong>
                                <button
                                    type="button"
                                    onClick={() => controllerRef.current?.setZonesVisible(!zonesVisible)}
                                >
                                    {zonesVisible ? 'Скрыть' : 'Показать'}
                                </button>
                            </div>
                            {zonesStatus === 'loading' && <span>Загружаются…</span>}
                            {zonesStatus === 'error' && (
                                <button
                                    type="button"
                                    className="route-map-zone-retry"
                                    onClick={() => controllerRef.current?.retryZones()}
                                >
                                    Повторить загрузку
                                </button>
                            )}
                            {zonesStatus === 'ready' && (
                                <div className="route-map-zone-list">
                                    {zoneLegend.map((zone) => (
                                        <span
                                            key={zone.name}
                                            className={activeZones.includes(zone.name) ? 'is-active' : ''}
                                        >
                                            <i style={{ backgroundColor: zone.color }} />
                                            {zone.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {(errorMessage || zoneWarning) && mapStatus === 'ready' && (
                <div className="route-map-notice" role="alert">
                    <span>{errorMessage || zoneWarning}</span>
                    {routeStatus === 'error' && (
                        <button type="button" onClick={() => controllerRef.current?.retry()}>
                            Повторить маршрут
                        </button>
                    )}
                </div>
            )}

            {routeAlternatives.length > 0 && (
                <div className="route-map-alternatives">
                    <div className="route-map-alternatives-heading">
                        <div>
                            <strong>Варианты маршрута</strong>
                            <span>Нажмите на линию маршрута на карте, чтобы сменить вариант.</span>
                        </div>
                    </div>
                    <div className="route-map-alternatives-list">
                        {routeAlternatives.map((alternative) => (
                            <button
                                key={alternative.id}
                                type="button"
                                className={alternative.isActive ? 'is-active' : ''}
                                aria-pressed={alternative.isActive}
                                onClick={() => controllerRef.current?.selectAlternative(alternative.id)}
                            >
                                <div>
                                    <strong>{alternative.label}</strong>
                                    {alternative.isBlocked && <em>Есть перекрытия</em>}
                                </div>
                                <span>{alternative.distanceText}</span>
                                <span>{alternative.durationText}</span>
                                {alternative.arrivalTime && (
                                    <small>Прибытие ~ {alternative.arrivalTime}</small>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Test;
