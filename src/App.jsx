import Test from "./Test.jsx";
import WeightDistanceInput from "./WeightDistanceInput"; // Import the new component at the top
import {useEffect, useState} from "react";
import {calculate, config, vehiclesConfig} from "../script.jsx";
import DeliveryOptions from "./DeliveryOptions.jsx";
import VehicleSelection from "./VehicleSelection.jsx";
import ResultDisplay from "./ResultDisplay.jsx";

function App() {
    const getFromLocalStorageOrDefault = (key, defaultValue) => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    };

    // Initial state values retrieved from localStorage or default values
    const [distance, setDistance] = useState(getFromLocalStorageOrDefault('distance', 0));
    const [region, setRegion] = useState(getFromLocalStorageOrDefault('region', ''));
    const [duration, setDuration] = useState(getFromLocalStorageOrDefault('duration', 0));
    const [weight, setWeight] = useState(getFromLocalStorageOrDefault('weight', 100));
    const [options, setOptions] = useState(getFromLocalStorageOrDefault('options', {
        by_time: false,
        right_now: false,
        price: false
    }));
    const [vehicle, setVehicle] = useState(getFromLocalStorageOrDefault('vehicle', 0));
    const [price, setPrice] = useState(getFromLocalStorageOrDefault('price', {
        price: 0,
        description: [""]
    }));

    useEffect(() => {
        localStorage.setItem('distance', JSON.stringify(distance));
        localStorage.setItem('region', JSON.stringify(region));
        localStorage.setItem('duration', JSON.stringify(duration));
        localStorage.setItem('weight', JSON.stringify(weight));
        localStorage.setItem('options', JSON.stringify(options));
        localStorage.setItem('vehicle', JSON.stringify(vehicle));
        localStorage.setItem('price', JSON.stringify(price));

        // Calculate price whenever distance, duration, or weight changes
        let params = {
            distance: distance,
            duration: duration,
            weight: weight,
            options: options,
            vehicle: vehicle,
            region: region
        };
        const calculatedPrice = calculate(params);
        setPrice(calculatedPrice);
    }, [distance, duration, weight, options, vehicle, region]);

    const handleOptionChange = (option) => {
        if (option === 'by_time' && options[option]) {
            setOptions(prevOptions => ({
                ...prevOptions,
                [option]: !prevOptions[option],
                right_now: false
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
    };

    return (
        <div className="w-full h-screen bg-white flex justify-center items-center">
            <div className="bg-white w-full h-screen md:w-full md:h-full flex flex-col">
                {/* Map container */}
                <div className="w-full flex-shrink-0 min-h-[500px] min-w-[300px] md:min-h-[600px] md:min-w-[400px]">
                    <Test setDistance={setDistance} setDuration={setDuration} setRegion={setRegion}/>
                </div>
                <hr className="bg-gray-400 h-0.5"/>
                {/* Content container */}
                <div className="p-4 text-lg font-sans flex flex-col flex-grow">
                    <div className="flex-grow">
                        <WeightDistanceInput
                            weight={weight}
                            handleWeightChange={handleWeightChange}
                            distance={distance}
                            setDistance={setDistance}
                            vehicle={vehicle}
                        />
                        <div className="mt-4">
                            <div className="flex flex-row gap-10 mt-4">
                                <DeliveryOptions options={options} handleOptionChange={handleOptionChange}/>
                            </div>
                            <VehicleSelection vehiclesConfig={vehiclesConfig} weight={weight} vehicle={vehicle} setVehicle={setVehicle}/>
                        </div>
                        <ResultDisplay distance={distance} duration={duration} region={region} price={price} weight={weight}/>
                    </div>
                    {/* Button placed outside the flex-grow div to prevent overflow */}
                    <button className="mt-0 rounded-md text-white p-4 mx-2 text-3xl bg-blue-600" onClick={reset}>Сбросить</button>
                </div>
            </div>
        </div>
    )


}

export default App;
