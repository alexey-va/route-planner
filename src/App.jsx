import Test, { routePanelControl } from "./Test.jsx";
import WeightDistanceInput from "./WeightDistanceInput";
import { useEffect, useRef } from "react";
import { calculate, vehiclesConfig } from "./script.jsx";
import DeliveryOptions from "./DeliveryOptions.jsx";
import VehicleSelection from "./VehicleSelection.jsx";
import ResultDisplay from "./ResultDisplay.jsx";
import Advanced from "./Advanced.jsx";
import CalculationHistory from "./components/CalculationHistory";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useCalculationHistory } from "./hooks/useCalculationHistory";
import { handleOptionChange, findNextAvailableVehicle } from "./utils/optionHandlers";
import { validateFields } from "./utils/validation";

const DEFAULT_OPTIONS = {
    by_time: false,
    morning: false,
    evening: false,
    cement: false,
    day_of_week: "none"
};

const DEFAULT_PRICE = {
    price: 0,
    description: [""]
};

function App() {
    // State with localStorage persistence
    const [time, setTime] = useLocalStorage('time', 'day');
    const [distance, setDistance] = useLocalStorage('distance', 0);
    const [region, setRegion] = useLocalStorage('region', '');
    const [regions, setRegions] = useLocalStorage('regions', []);
    const [address, setAddress] = useLocalStorage('address', '');
    const [duration, setDuration] = useLocalStorage('duration', 0);
    const [weight, setWeight] = useLocalStorage('weight', 100);
    const [options, setOptions] = useLocalStorage('options', DEFAULT_OPTIONS);
    const [vehicle, setVehicle] = useLocalStorage('vehicle', 0);
    const [mapDistance, setMapDistance] = useLocalStorage('mapDistance', 0);
    const [price, setPrice] = useLocalStorage('price', DEFAULT_PRICE);
    const [advanced, setAdvanced] = useLocalStorage('advanced', {});

    // History management
    const { history, addToHistory, removeFromHistory, clearHistory } = useCalculationHistory();

    // Validation
    const validation = validateFields(distance, weight, options, region, mapDistance);

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
            advanced
        };
        const calculatedPrice = calculate(params);
        setPrice(calculatedPrice);
    }, [distance, duration, weight, options, vehicle, region, regions, time, advanced, setPrice]);


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
                advanced,
                time,
                price
            });
        }
        
        setDistance(0);
        setRegion(''); // Fixed: was setRegion([]), should be empty string
        setDuration(0);
        setWeight(100);
        setOptions(DEFAULT_OPTIONS);
        setVehicle(0);
        setPrice(DEFAULT_PRICE);
        setAddress('');
        setMapDistance(0);
        setRegions([]); // Fixed: was setRegions(false), should be empty array
        setAdvanced({});
        setTime('day');
        
        // Reset map if available
        if (routePanelControl) {
            routePanelControl.routePanel.state.set({
                fromEnabled: false,
                from: routePanelControl.routePanel.state.get("from"),
                to: "",
                type: "auto"
            });
        }
    };

    return (
        <div className="w-full h-full flex justify-center items-center max-md:p-0 md:mt-4 no-scrollbar">
            <div className="max-md:p-0 max-md:w-full max-md:h-full min-w-[50rem] max-sm:min-w-[20rem] bg-white
             max-md:drop-shadow-none max-md:rounded-none drop-shadow-xl rounded-md max-md:my-0 ">
                <div className="w-full flex flex-col self-start h-full ">
                    {/* Map container */}
                    <div className="relative w-full h-[500px] min-h-[500px] min-w-[400px]
                     md:min-h-[500px] md:min-w-[350px] max-sm:min-w-[20rem] grow md:px-1 md:pt-1 ">
                        <Test setDistance={setDistance}
                              setDuration={setDuration}
                              setRegion={setRegion}
                              vehicle={vehicle}
                              setAddress={setAddress}
                              setMapDistance={setMapDistance}
                              setRegions={setRegions}
                        />


                    </div>
                    {/* Content container */}
                    <div className="px-4 py-2 text-lg font-sans flex flex-col border-t-2 grow">
                        {/* History button */}
                        <div className="flex justify-end mb-2">
                            <CalculationHistory
                                history={history}
                                onRemove={removeFromHistory}
                                onClear={clearHistory}
                            />
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

                        <div className="mt-1">
                            <label className="font-semibold max-sm:text-lg text-xl">Настройки</label>
                            <div className="mt-0 flex flex-col">
                                <DeliveryOptions 
                                    options={options}
                                    handleOptionChange={onOptionChange}
                                    handleTimeChange={setTime}
                                    advanced={advanced}
                                    regions={regions}
                                    vehicle={vehicle}
                                    validationErrors={validation.errors}
                                    validationWarnings={validation.warnings}
                                />
                                <VehicleSelection vehiclesConfig={vehiclesConfig} weight={weight} vehicle={vehicle}
                                                  setVehicle={setVehicle}/>
                            </div>
                            <Advanced regions={regions} vehicle={vehicle} advanced={advanced}
                                      setAdvanced={setAdvanced}/>
                        </div>
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
                        />


                    </div>
                </div>
            </div>
        </div>
    )


}

export default App;
