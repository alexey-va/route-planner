import React from 'react';
import { formatDistance, formatWeight } from './utils/formatters';

const MAX_DISTANCE_KM = 10000;
const WEEKEND_WEIGHT_WARNING_THRESHOLD = 500;

function WeightDistanceInput({
    weight,
    handleWeightChange,
    distance,
    setDistance,
    options,
    vehicle
}) {
    const displayDistance = formatDistance(distance);
    const displayWeight = formatWeight(weight);

    // Calculate label positions based on content length
    const kgLabelStyle = {
        left: `${Math.max(1, displayWeight.length) / 1.6 + 1.0}rem`,
    };

    const kmLabelStyle = {
        left: `${Math.max(1, displayDistance.length - (displayDistance.includes('.') ? 0.4 : 0)) / 1.6 + 1.0}rem`,
    };

    const isWeekend = ['sunday', 'saturday'].includes(options.day_of_week);
    const showWeekendWarning = isWeekend && parseFloat(displayWeight) > WEEKEND_WEIGHT_WARNING_THRESHOLD;

    const handleDistanceChange = (e) => {
        let km = parseFloat(e.target.value);
        
        // Clamp to valid range
        if (km >= MAX_DISTANCE_KM) km = MAX_DISTANCE_KM;
        if (km < 0 || isNaN(km)) km = 0;
        
        // Convert kilometers to meters for internal state
        setDistance(km * 1000);
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
                        max={MAX_DISTANCE_KM}
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
                    ${showWeekendWarning ? "border-4 border-red-500 animate-pulse" : "border-gray-300"}`}
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

                {showWeekendWarning && (
                    <p className="text-red-500 text-sm font-semibold mt-1 animate-pulse">
                        Более 800кг в выходные дни +50%
                    </p>
                )}
            </div>



        </div>
    );
}

export default WeightDistanceInput;
