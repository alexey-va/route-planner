import {useEffect} from "react";

export let routePanelControl; // Move this to the outer scope

function Test({setDistance, setDuration, setRegion, setAddress, setMapDistance, setRegions}) {
    useEffect(() => {
        ymaps.ready(init);
    }, []);


    function init() {
        routePanelControl = new ymaps.control.RoutePanel({
            options: {
                // Добавим заголовок панели.
                showHeader: true,
                title: 'Расчёт доставки',
                maxWidth: 500,
            }
        });
        // Стоимость за километр.
        var myMap = new ymaps.Map('map', {
            center: [49.605433, 58.565190],
            zoom: 12,
            controls: []
        }),
        zoomControl = new ymaps.control.ZoomControl({
                options: {
                    size: 'small',
                    float: 'none',
                    position: {
                        bottom: 145,
                        right: 10
                    }
                }
            }), deliveryPoint = new ymaps.GeoObject({
                geometry: {type: 'Point'},
                properties: {iconCaption: 'Адрес'}
            }, {
                preset: 'islands#blackDotIconWithCaption',
                draggable: true,
                iconCaptionMaxWidth: '215'
            }), deliveryZones;
        myMap.geoObjects.add(deliveryPoint);

        // Пользователь сможет построить только автомобильный маршрут.
        routePanelControl.routePanel.options.set({
            types: {auto: true}
        });

        // Если вы хотите задать неизменяемую точку "откуда", раскомментируйте код ниже.
        routePanelControl.routePanel.state.set({
            fromEnabled: false,
            from: 'Киров, Коммунальная 5'
        });

        myMap.controls.add(routePanelControl).add(zoomControl);

        // Получим ссылку на маршрут.
        routePanelControl.routePanel.getRouteAsync().then(function (route) {

            // Зададим максимально допустимое число маршрутов, возвращаемых мультимаршрутизатором.
            route.model.setParams({results: 1}, true);

            // Повесим обработчик на событие построения маршрута.
            route.model.events.add('requestsuccess', function () {

                var activeRoute = route.getActiveRoute();
                if (activeRoute) {
                    // Получим протяженность маршрута.
                    var coords = route.properties.get("rawProperties").RouterMetaData.Waypoints[1].coordinates;
                    var address = route.properties.get("rawProperties").RouterMetaData.Waypoints[1].name
                    //console.log(activeRoute)
                    //console.log(myMap)
                    //console.log(coords)
                    //console.log(route.properties.get("rawProperties").RouterMetaData.Waypoints[1].coordinates)
                    var polygons = deliveryZones.searchContaining(coords);

                    // check that at least one polygon is За Мостом
                    let bridge = false;
                    let comintern = false;
                    polygons.each(function (obj) {
                        if (obj.properties.get('description') === "За мостом") {
                            bridge = true;
                        } else if (obj.properties.get('description') === "Коминтерн") {
                            comintern = true;
                        }
                    });
                    let regions = []
                    if(bridge) regions.push("За мостом")
                    if(comintern) regions.push("Коминтерн")
                    setRegions(regions)
                    var polygon = polygons.get(0);
                    var region = !polygon ? "Область" : polygon.properties.get('description');
                    if(region === 'За мостом') region = 'Область'

                    setRegion(region);
                    var duration = route.getActiveRoute().properties.get("duration");
                    var length = route.getActiveRoute().properties.get("distance");
                    setDistance(length.value)
                    setMapDistance(length.value)
                    setDuration(duration.value)
                    setAddress(address)

                    let balloonContentLayout = ymaps.templateLayoutFactory.createClass(
                        '<span>Расстояние: ' + length.text + '.</span><br/>'
                        //+ '<span style="font-weight: bold; font-style: italic">Стоимость доставки: ' + price + ' р.</span>'
                    );
                    // Зададим этот макет для содержимого балуна.
                    route.options.set('routeBalloonContentLayout', balloonContentLayout);
                    // Откроем балун.
                    activeRoute.balloon.open();
                }
            });


            function onZonesLoad(json) {
                // Добавляем зоны на карту.
                deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
                // Задаём цвет и контент балунов полигонов.
                deliveryZones.each(function (obj) {
                    obj.options.set({
                        fillColor: obj.properties.get('fill'),
                        fillOpacity: obj.properties.get('fill-opacity'),
                        strokeColor: obj.properties.get('stroke'),
                        strokeWidth: obj.properties.get('stroke-width'),
                        strokeOpacity: obj.properties.get('stroke-opacity')
                    });
                    obj.properties.set('balloonContent', obj.properties.get('description'));
                });
            }

            fetch('./data.geojson')
                .then(response => response.json())
                .then(data => onZonesLoad(data))
                .catch(error => console.error('Error fetching data:', error));

        });
        // Функция, вычисляющая стоимость доставки.
    }

    return (
        <>
            <div className="w-full h-full bg-gray-100" id="map"></div>
        </>
    );
}

export default Test;