import React from 'react';
import {vehiclesConfig} from "./script.jsx";

function WeightDistanceInput({
                                 weight,
                                 handleWeightChange,
                                 distance,
                                 setDistance,
                                 options,
                                 vehicle
                             }) {

    let displayDistance = (distance / 1000).toString();
    if (displayDistance.includes('.')) {
        displayDistance = displayDistance.slice(0, displayDistance.indexOf('.') + 2);
    }


    let displayWeight = (weight).toString();
    if (displayWeight.includes('.')) {
        displayWeight = displayWeight.slice(0, displayWeight.indexOf('.'));
    }

    // Calculate left offset based on the content length
    const kgLabelStyle = {
        left: `${Math.max(1, displayWeight.length) / 1.6 + 1.0}rem`,
    };

    const kmLabelStyle = {
        left: `${Math.max(1, displayDistance.length - (displayDistance.includes('.') ? 0.4 : 0)) / 1.6 + 1.0}rem`,
    };

    const isWeekend = ['sunday', 'saturday'].includes(options.day_of_week);


    const handleDistanceChange = (e) => {
        let km = parseFloat(e.target.value); // Convert input from string to float
        //if (km < 0) return; // Do not update distance if input is invalid
        if (km >= 10000) km = 10000;
        if (km < 0 || isNaN(km)) km = 0;
        setDistance(km * 1000); // Convert kilometers back to meters for internal state
    };

    return (
        <div className={`max-sm:text-lg text-xl grid grid-cols-[2fr_2.2fr] gap-12`}>
            {/* DISTANCE */}
            <div className="relative mt-1">
                <div className={`relative`}>
                    {/*<div className={`absolute inset-0 w-[9.5rem] -left-0.5 rounded-sm ${vehiclesConfig[vehicle].heavy ? "animate-pulseOutline ring-2 ring-red-500 ring-opacity-100" : ""}`}></div>*/}
                    <label htmlFor="distance" className="font-semibold overflow-hidden whitespace-nowrap">
                        Расстояние (км):
                    </label>
                </div>
                <div className="flex items-center border border-gray-300 rounded-md mt-1">
                    <input
                        type="number"
                        id="distance"
                        min={0}
                        max={10000}
                        placeholder="0"
                        step="any"
                        value={displayDistance}
                        onChange={handleDistanceChange}
                        className="min-sm:text-lg w-full p-1 rounded-md pl-2 pr-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="pointer-events-none absolute text-gray-400" style={kmLabelStyle}>км</span>
                </div>
            </div>
            {/* WEIGHT */}
            <div className="relative mt-1">
                <label htmlFor="weight" className="font-semibold overflow-clip">
                    Вес (кг):
                </label>
                <div className={`flex items-center border rounded-md mt-1 transition-all duration-300
        ${isWeekend && displayWeight > 500 ? "border-4 border-red-500 animate-pulse" : "border-gray-300"}`}
                >
                    <input
                        type="number"
                        id="weight"
                        min={1}
                        max={100000}
                        step={10}
                        placeholder="Введите вес"
                        value={displayWeight}
                        onChange={handleWeightChange}
                        className="min-sm:text-lg w-full p-1 rounded-md pl-2 pr-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="pointer-events-none absolute text-gray-400" style={kgLabelStyle}>кг</span>
                </div>

                {isWeekend && displayWeight > 500 && (
                    <p className="text-red-500 text-sm font-semibold mt-1 animate-pulse">
                        Более 500кг в выходние дни +100%
                    </p>
                )}
            </div>



            {/* PURCHASE AMOUNT */}
        </div>
    );
}

export default WeightDistanceInput;
