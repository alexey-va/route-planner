import React from 'react';
import {vehiclesConfig} from "../script.jsx";

function WeightDistanceInput({
                                 weight,
                                 handleWeightChange,
                                 distance,
                                 setDistance,
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


    const handleDistanceChange = (e) => {
        let km = parseFloat(e.target.value); // Convert input from string to float
        //if (km < 0) return; // Do not update distance if input is invalid
        if (km >= 10000) km = 10000;
        if (km < 0 || isNaN(km)) km = 0;
        setDistance(km * 1000); // Convert kilometers back to meters for internal state
    };

    return (
        <div>
            {/* WEIGHT */}
            <div className="relative mt-1">
                <label htmlFor="weight" className="font-semibold text-l">Вес (кг):</label>
                <div className="flex items-center border border-gray-300 rounded-md mt-1">
                    <input
                        type="number"
                        id="weight"
                        min={1}
                        max={100000}
                        step={10}
                        placeholder="Введите вес"
                        value={displayWeight}
                        onChange={handleWeightChange}
                        className="w-full p-1 rounded-md pl-2 pr-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="pointer-events-none absolute text-gray-400" style={kgLabelStyle}>кг</span>
                </div>
            </div>
            {/* DISTANCE */}
            <div className="relative mt-2">
                <div className={`relative`}>
                    {/*<div className={`absolute inset-0 w-[9.5rem] -left-0.5 rounded-sm ${vehiclesConfig[vehicle].heavy ? "animate-pulseOutline ring-2 ring-red-500 ring-opacity-100" : ""}`}></div>*/}
                    <label htmlFor="distance" className="font-semibold text-l block bg-transparent z-10 relative">
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
                        className="w-full p-1 rounded-md pl-2 pr-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="pointer-events-none absolute text-gray-400" style={kmLabelStyle}>км</span>
                </div>
            </div>
            {/* PURCHASE AMOUNT */}
        </div>
    );
}

export default WeightDistanceInput;
