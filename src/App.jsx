import Test, {routePanelControl} from "./Test.jsx";
import WeightDistanceInput from "./WeightDistanceInput"; // Import the new component at the top
import {useEffect, useState} from "react";
import {calculate, vehiclesConfig} from "./script.jsx";
import DeliveryOptions from "./DeliveryOptions.jsx";
import VehicleSelection from "./VehicleSelection.jsx";
import ResultDisplay from "./ResultDisplay.jsx";

function App() {
    const getFromLocalStorageOrDefault = (key, defaultValue) => {
        let lastUpdateDate = localStorage.getItem('last_updated');
        if (lastUpdateDate) {
            let currentDate = Date.now();
            let diff = currentDate - lastUpdateDate;
            if (diff > 1000 * 60 * 30) {
                localStorage.clear();
            }
        }
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    };


    // Initial state values retrieved from localStorage or default values
    const [time, setTime] = useState(getFromLocalStorageOrDefault('time', 'day'))
    const [distance, setDistance] = useState(getFromLocalStorageOrDefault('distance', 0));
    const [region, setRegion] = useState(getFromLocalStorageOrDefault('region', ''));
    const [bridge, setBridge] = useState(getFromLocalStorageOrDefault('bridge', false))
    const [address, setAddress] = useState(getFromLocalStorageOrDefault('address', ''))
    const [duration, setDuration] = useState(getFromLocalStorageOrDefault('duration', 0));
    const [weight, setWeight] = useState(getFromLocalStorageOrDefault('weight', 100));
    const [options, setOptions] = useState(getFromLocalStorageOrDefault('options', {
        by_time: false,
        morning: false,
        evening: false,
        price: false,
        opt: false
    }));
    const [vehicle, setVehicle] = useState(getFromLocalStorageOrDefault('vehicle', 0));
    const [mapDistance, setMapDistance] = useState(getFromLocalStorageOrDefault('mapDistance', 0))
    const [price, setPrice] = useState(getFromLocalStorageOrDefault('price', {
        price: 0,
        description: [""]
    }));

    useEffect(() => {
        localStorage.setItem('last_updated', Date.now());
        localStorage.setItem('distance', JSON.stringify(distance));
        localStorage.setItem('region', JSON.stringify(region));
        localStorage.setItem('duration', JSON.stringify(duration));
        localStorage.setItem('weight', JSON.stringify(weight));
        localStorage.setItem('options', JSON.stringify(options));
        localStorage.setItem('vehicle', JSON.stringify(vehicle));
        localStorage.setItem('price', JSON.stringify(price));
        localStorage.setItem('address', JSON.stringify(address));
        localStorage.setItem('mapDistance', JSON.stringify(mapDistance));
        localStorage.setItem('time', JSON.stringify(time));

        // Calculate price whenever distance, duration, or weight changes
        let params = {
            distance: distance,
            duration: duration,
            weight: weight,
            options: options,
            vehicle: vehicle,
            region: region,
            bridge: bridge,
            time: time
        };
        const calculatedPrice = calculate(params);
        setPrice(calculatedPrice);
    }, [distance, duration, weight, options, vehicle, region, time]);

    const handleOptionChange = (option) => {
        if (option === 'opt' && !options[option]) {
            setOptions(prevOptions => ({
                ...prevOptions,
                [option]: !prevOptions[option],
                price: false
            }));
        } else if (option === 'by_time' || option === 'morning' || option === 'evening') {
            let newOptions = {
                by_time: false,
                morning: false,
                evening: false,
            };
            newOptions[option] = !options[option];
            setOptions(prevOptions => ({
                ...prevOptions,
                ...newOptions
            }));
        } else {
            setOptions(prevOptions => ({
                ...prevOptions,
                [option]: !prevOptions[option]
            }));
        }
    };

    const handleWeightChange = (e) => {
        let newWeight = parseFloat(e.target.value);
        let amount = newWeight;
        if (amount >= 100000) amount = 100000;
        if (amount === '' || isNaN(amount)) amount = 0;
        setWeight(amount);

        // Check if weight exceeds max weight of selected vehicle
        const selectedVehicleConfig = vehiclesConfig[vehicle];
        if (selectedVehicleConfig && amount > selectedVehicleConfig.max_weight) {
            // Find the next available vehicle
            let nextAvailableVehicle = 0;
            for (const [key, value] of Object.entries(vehiclesConfig)) {
                if (value.max_weight >= amount) {
                    nextAvailableVehicle = parseInt(key);
                    break;
                }
            }
            setVehicle(nextAvailableVehicle);
        }
    };

    const reset = () => {
        setDistance(0);
        setRegion('');
        setDuration(0);
        setWeight(100);
        setOptions({
            by_time: false,
            right_now: false,
            price: false
        });
        setVehicle(0);
        setPrice({
            price: 0,
            description: [""],
        });
        setAddress('')
        setMapDistance(0)
        setBridge(false)
        if (routePanelControl) {
            routePanelControl.routePanel.state.set({
                fromEnabled: false,
                from: routePanelControl.routePanel.state.get("from"),
                to: "",
                type: "auto"
            })
        }
        setTime('day')
    };

    return (
        <div className="w-full h-full flex justify-center items-center max-md:p-0">
            <div className="max-md:p-0 max-md:w-full max-md:h-full min-w-[40rem] max-sm:min-w-[20rem] bg-white flex justify-center
             items-center max-md:drop-shadow-none max-md:rounded-none drop-shadow-xl rounded-md max-md:my-0 ">
                <div className="w-full flex flex-col self-start h-full">
                    {/* Map container */}
                    <div className="relative w-full h-[500px] min-h-[500px] min-w-[400px]
                     md:min-h-[500px] md:min-w-[350px] max-sm:min-w-[20rem] grow">
                        <Test setDistance={setDistance}
                              setDuration={setDuration}
                              setRegion={setRegion}
                              vehicle={vehicle}
                              setAddress={setAddress}
                              setMapDistance={setMapDistance}
                              setBridge={setBridge}
                        />
                        {/*                    {vehiclesConfig[vehicle].heavy ? <div
                        className="transition-all animate-pulseOutline left-1 bottom-1 absolute w-[8.75rem] h-[2rem]
                         ring-2 ring-red-500 ring-opacity-100 rounded-sm pointer-events-none"></div> : ""}*/}

                    </div>
                    {/* Content container */}
                    <div className="px-4 py-2 text-lg font-sans flex flex-col border-t-2 grow">
                        <WeightDistanceInput
                            weight={weight}
                            handleWeightChange={handleWeightChange}
                            distance={distance}
                            setDistance={setDistance}
                            vehicle={vehicle}
                        />

                        <div className="mt-1">
                            <label className="font-semibold max-sm:text-lg text-xl">Настройки</label>
                            <div className="mt-0 flex flex-col">
                                <DeliveryOptions options={options}
                                                 handleOptionChange={handleOptionChange}
                                                 handleTimeChange={(value) => setTime(value)}
                                />
                                <VehicleSelection vehiclesConfig={vehiclesConfig} weight={weight} vehicle={vehicle}
                                                  setVehicle={setVehicle}/>
                            </div>
                        </div>
                        <ResultDisplay distance={distance}
                                       mapDistance={mapDistance}
                                       duration={duration}
                                       region={region}
                                       price={price}
                                       address={address}
                                       bridge={bridge}
                                       weight={weight}
                                       reset={reset}
                        />


                    </div>
                </div>
            </div>
        </div>
    )


}

export default App;
