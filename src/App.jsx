import Test, { routeMapController } from "./Test.jsx";
import WeightDistanceInput from "./WeightDistanceInput";
import { useEffect, useState } from "react";
import { calculate, vehiclesConfig } from "./script.jsx";
import DeliveryOptions from "./DeliveryOptions.jsx";
import VehicleSelection from "./VehicleSelection.jsx";
import ResultDisplay from "./ResultDisplay.jsx";
import CalculationHistory from "./components/CalculationHistory";
import PricingRules from "./components/PricingRules";
import TariffReference from "./components/TariffReference";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAdminAccess } from "./hooks/useAdminAccess";
import { useCalculationHistory } from "./hooks/useCalculationHistory";
import { handleOptionChange, findNextAvailableVehicle } from "./utils/optionHandlers";
import { validateFields } from "./utils/validation";

const DEFAULT_OPTIONS = {
    by_time: false,
    morning: false,
    evening: false,
    retail: true,   // по умолчанию розница (одна из retail/opt всегда выбрана)
    opt: false,
    day_of_week: "none"
};

const DEFAULT_PRICE = {
    price: 0,
    description: [""]
};

const LEGACY_APP_DOCUMENT = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Классический калькулятор доставки</title>
    <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;coordorder=longlat&amp;apikey=6ed1e48a-8c3f-47a5-8192-4b5c04e3dc05&amp;suggest_apikey=a802db44-bd3b-4d25-a554-035219420a69"></script>
    <script src="https://yandex.st/jquery/2.2.3/jquery.js"></script>
    <script type="module" crossorigin src="/legacy/assets/index-Dt9U6nZw.js"></script>
    <link rel="stylesheet" crossorigin href="/legacy/assets/index-DXN-bJtr.css" />
    <style>
      body {
        font-size: 17px;
      }
      .text-xs {
        font-size: 13px;
        line-height: 17px;
      }
      .text-sm {
        font-size: 15px;
        line-height: 21px;
      }
      .text-lg {
        font-size: 19px;
        line-height: 29px;
      }
      .text-xl {
        font-size: 21px;
        line-height: 29px;
      }
      .text-2xl {
        font-size: 25px;
        line-height: 33px;
      }
      .text-3xl {
        font-size: 31px;
        line-height: 37px;
      }
      .truncate {
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        overflow-wrap: anywhere;
      }
      @media (max-width: 639px) {
        .max-sm\\:text-sm {
          font-size: 15px;
          line-height: 21px;
        }
        .max-sm\\:text-lg {
          font-size: 19px;
          line-height: 29px;
        }
        .max-sm\\:text-xl {
          font-size: 21px;
          line-height: 29px;
        }
      }
      @media (max-width: 480px) {
        #map [class*="control-popup"]:has([class*="route-panel"]) {
          box-sizing: border-box;
          width: calc(100vw - 10px) !important;
          max-width: calc(100vw - 10px) !important;
        }
      }
      @media (min-width: 768px) and (max-width: 1023px) {
        .min-w-\\[50rem\\] {
          width: 100%;
          min-width: 0;
        }
      }
      @media (max-width: 379px) {
        .max-xs\\:text-xs {
          font-size: 13px;
          line-height: 17px;
        }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function InterfaceModeToggle({ mode, onChange }) {
    return (
        <div className="route-interface-toggle" role="group" aria-label="Версия интерфейса">
            <button
                type="button"
                className={mode === 'modern' ? 'is-active' : ''}
                aria-pressed={mode === 'modern'}
                onClick={() => onChange('modern')}
            >
                Новый
            </button>
            <button
                type="button"
                className={mode === 'legacy' ? 'is-active' : ''}
                aria-pressed={mode === 'legacy'}
                onClick={() => onChange('legacy')}
            >
                Классический
            </button>
        </div>
    );
}

function ModernApp({ onSelectLegacy }) {
    // State with localStorage persistence
    const [time, setTime] = useLocalStorage('time', 'day');
    const [distance, setDistance] = useLocalStorage('distance', 0);
    const [region, setRegion] = useLocalStorage('region', '');
    const [regions, setRegions] = useLocalStorage('regions', []);
    const [address, setAddress] = useLocalStorage('address', '');
    const [duration, setDuration] = useLocalStorage('duration', 0);
    const [weight, setWeight] = useLocalStorage('weight', 1);
    const [options, setOptions] = useLocalStorage('options', DEFAULT_OPTIONS);
    const [vehicle, setVehicle] = useLocalStorage('vehicle', 0);
    const [mapDistance, setMapDistance] = useLocalStorage('mapDistance', 0);
    const [price, setPrice] = useLocalStorage('price', DEFAULT_PRICE);
    const [orderTotal, setOrderTotal] = useLocalStorage('orderTotal', 0);

    // History management
    const { history, addToHistory, removeFromHistory, clearHistory } = useCalculationHistory();
    const { isUnlocked, unlock, lock } = useAdminAccess();

    // Validation
    const validation = validateFields(distance, weight, options, region, mapDistance, orderTotal);

    // Calculate price whenever relevant parameters change
    useEffect(() => {
        const params = {
            distance,
            duration,
            weight,
            options,
            vehicle,
            region,
            regions,
            time,
            orderTotal
        };
        const calculatedPrice = calculate(params);
        setPrice(calculatedPrice);
    }, [distance, duration, weight, options, vehicle, region, regions, time, orderTotal, setPrice]);


    const onOptionChange = (option) => {
        handleOptionChange(option, options, setOptions);
    };

    const handleWeightChange = (e) => {
        let newWeight = parseFloat(e.target.value);
        
        // Clamp weight to valid range
        if (newWeight >= 100000) newWeight = 100000;
        if (newWeight === '' || isNaN(newWeight)) newWeight = 0;
        
        setWeight(newWeight);

        // Auto-select appropriate vehicle if weight exceeds current vehicle capacity
        const selectedVehicleConfig = vehiclesConfig[vehicle];
        if (selectedVehicleConfig && newWeight > selectedVehicleConfig.max_weight) {
            const nextAvailableVehicle = findNextAvailableVehicle(newWeight, vehiclesConfig);
            setVehicle(nextAvailableVehicle);
        }
    };

    const reset = () => {
        // Save current calculation to history before resetting (if valid)
        // Расстояние может быть введено вручную или выбрано на карте
        const hasDistance = (distance > 0) || (mapDistance > 0);
        const isValid = price.price >= 0 && 
                       hasDistance && 
                       options.day_of_week !== "none";
        
        if (isValid) {
            addToHistory({
                distance,
                region,
                regions,
                address,
                duration,
                weight,
                options,
                vehicle,
                mapDistance,
                time,
                price
            });
        }
        
        setDistance(0);
        setRegion(''); // Fixed: was setRegion([]), should be empty string
        setDuration(0);
        setWeight(1);
        setOptions(DEFAULT_OPTIONS);
        setVehicle(0);
        setPrice(DEFAULT_PRICE);
        setAddress('');
        setMapDistance(0);
        setRegions([]);
        setTime('day');
        setOrderTotal(0);
        
        routeMapController?.reset();
    };

    const distanceKm = ((distance || 0) / 1000).toFixed(1);
    const hasRoute = distance > 0 && region;

    return (
        <div className="route-app-shell">
            <header className="route-topbar">
                <div className="route-brand">
                    <div className="route-brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M4 7.5h10.5v9H4zM14.5 11h3.1l2.4 2.7v2.8h-5.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                            <circle cx="7.2" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.7"/>
                            <circle cx="17.4" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.7"/>
                            <path d="M6.5 4.5h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <p className="route-brand-title">Маршрут</p>
                        <p className="route-brand-subtitle">Калькулятор доставки</p>
                    </div>
                </div>
                <div className="route-topbar-meta" aria-label="Статус сервиса">
                    <InterfaceModeToggle mode="modern" onChange={onSelectLegacy} />
                    <span className="route-status-pill">
                        <span className="route-status-dot" />
                        Расчёт онлайн
                    </span>
                    <span className="route-location-pill">Киров и область</span>
                </div>
            </header>

            <main className="route-workspace">
                <section className="route-map-column" aria-label="Маршрут доставки">
                    <article className="route-card route-map-card">
                        <div className="route-card-header route-map-header">
                            <div>
                                <span className="route-eyebrow">Шаг 1 · маршрут</span>
                                <h1>Куда доставить?</h1>
                                <p>Укажите адрес на карте — расстояние и район определятся автоматически.</p>
                            </div>
                            <div className="route-map-metrics" aria-live="polite">
                                <div>
                                    <span>Расстояние</span>
                                    <strong>{distanceKm} км</strong>
                                </div>
                                <div>
                                    <span>Зона</span>
                                    <strong>{region || 'Не выбрана'}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="route-map-canvas">
                            <Test setDistance={setDistance}
                                  setDuration={setDuration}
                                  setRegion={setRegion}
                                  vehicle={vehicle}
                                  setAddress={setAddress}
                                  setMapDistance={setMapDistance}
                                  setRegions={setRegions}
                            />
                        </div>
                        <div className={`route-map-footer ${hasRoute ? 'is-ready' : ''}`}>
                            <span className="route-map-footer-icon" aria-hidden="true">
                                {hasRoute ? '✓' : '⌖'}
                            </span>
                            <div>
                                <strong>{hasRoute ? 'Маршрут построен' : 'Выберите адрес назначения'}</strong>
                                <span>{address || 'Начните вводить адрес в панели карты'}</span>
                            </div>
                        </div>
                    </article>

                </section>

                <aside className="route-card route-calculator-card" aria-label="Параметры и стоимость доставки">
                    <div className="route-calculator-header">
                        <div>
                            <span className="route-eyebrow">Калькулятор</span>
                            <h2>Параметры доставки</h2>
                            <p>Заполните поля — стоимость обновится сразу.</p>
                        </div>
                        <div className="route-toolbar">
                            <CalculationHistory
                                history={history}
                                onRemove={removeFromHistory}
                                onClear={clearHistory}
                            />
                            <PricingRules enabled={isUnlocked} />
                        </div>
                    </div>

                    <div className="route-calculator-body">
                        <section className="route-form-section">
                            <div className="route-section-title">
                                <span>1</span>
                                <div>
                                    <h3>Груз и расстояние</h3>
                                    <p>Можно скорректировать расстояние вручную.</p>
                                </div>
                            </div>
                            <WeightDistanceInput
                                weight={weight}
                                handleWeightChange={handleWeightChange}
                                distance={distance}
                                setDistance={setDistance}
                                vehicle={vehicle}
                                options={options}
                                validationErrors={validation.errors}
                                validationWarnings={validation.warnings}
                            />
                        </section>

                        <section className="route-form-section">
                            <div className="route-section-title">
                                <span>2</span>
                                <div>
                                    <h3>Условия доставки</h3>
                                    <p>Время, день и тип заказа влияют на тариф.</p>
                                </div>
                            </div>
                            <DeliveryOptions
                                options={options}
                                handleOptionChange={onOptionChange}
                                handleTimeChange={setTime}
                                validationErrors={validation.errors}
                                validationWarnings={validation.warnings}
                                orderTotal={orderTotal}
                                setOrderTotal={setOrderTotal}
                                showHints={isUnlocked}
                            />
                        </section>

                        <section className="route-form-section">
                            <div className="route-section-title">
                                <span>3</span>
                                <div>
                                    <h3>Автомобиль</h3>
                                    <p>Недоступные по весу машины отключены.</p>
                                </div>
                            </div>
                            <VehicleSelection vehiclesConfig={vehiclesConfig} weight={weight} vehicle={vehicle}
                                              setVehicle={setVehicle} showHints={isUnlocked}/>
                        </section>

                        <ResultDisplay distance={distance}
                                       mapDistance={mapDistance}
                                       duration={duration}
                                       region={region}
                                       price={price}
                                       address={address}
                                       regions={regions}
                                       weight={weight}
                                       reset={reset}
                                       validationErrors={validation.errors}
                                       validationWarnings={validation.warnings}
                                       showComments={isUnlocked}
                        />
                    </div>
                </aside>

                <TariffReference
                    vehiclesConfig={vehiclesConfig}
                    isUnlocked={isUnlocked}
                    onUnlock={unlock}
                    onLock={lock}
                />
            </main>

            <footer className="route-footer">
                Расчёт ориентировочный · итоговая стоимость подтверждается менеджером
            </footer>
        </div>
    )


}

function LegacyApp({ onSelectModern }) {
    return (
        <div className="route-legacy-shell">
            <header className="route-legacy-switchbar">
                <div>
                    <strong>Классический интерфейс</strong>
                    <span>Версия до редизайна</span>
                </div>
                <InterfaceModeToggle mode="legacy" onChange={onSelectModern} />
            </header>
            <iframe
                className="route-legacy-frame"
                srcDoc={LEGACY_APP_DOCUMENT}
                title="Классический интерфейс калькулятора доставки"
            />
        </div>
    );
}

function getInitialInterfaceMode() {
    const mode = new URLSearchParams(window.location.search).get('ui');
    return mode === 'modern' ? 'modern' : 'legacy';
}

function App() {
    const [interfaceMode, setInterfaceMode] = useState(getInitialInterfaceMode);

    const changeInterfaceMode = (mode) => {
        const nextMode = mode === 'legacy' ? 'legacy' : 'modern';
        const url = new URL(window.location.href);

        if (nextMode === 'modern') {
            url.searchParams.set('ui', 'modern');
        } else {
            url.searchParams.delete('ui');
        }

        window.history.replaceState({}, '', url);
        setInterfaceMode(nextMode);
    };

    if (interfaceMode === 'legacy') {
        return <LegacyApp onSelectModern={changeInterfaceMode} />;
    }

    return <ModernApp onSelectLegacy={changeInterfaceMode} />;
}

export default App;
