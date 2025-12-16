import React from 'react';
import { formatDistance, formatWeight } from './utils/formatters';
import { getFieldValidationClass } from './utils/validation';

const MAX_DISTANCE_KM = 10000;
const WEEKEND_WEIGHT_WARNING_THRESHOLD = 500;

function WeightDistanceInput({
    weight,
    handleWeightChange,
    distance,
    setDistance,
    options,
    vehicle,
    validationErrors = {},
    validationWarnings = {}
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
                <div className={`flex items-center rounded-md mt-1 ${getFieldValidationClass(
                    validationErrors.distance,
                    validationWarnings.distance
                )}`}>
                    <input
                        type="number"
                        id="distance"
                        min={0}
                        max={MAX_DISTANCE_KM}
                        placeholder="0"
                        step="any"
                        value={displayDistance}
                        onChange={handleDistanceChange}
                        className={`min-sm:text-lg w-full p-1 rounded-md pl-2 pr-2 focus:outline-none focus:ring-2 ${
                            validationErrors.distance 
                                ? 'focus:ring-red-500' 
                                : validationWarnings.distance 
                                    ? 'focus:ring-yellow-400' 
                                    : 'focus:ring-gray-500'
                        }`}
                    />
                    <span className="pointer-events-none absolute text-gray-400" style={kmLabelStyle}>км</span>
                </div>
                {validationErrors.distance && (
                    <p className="text-red-500 text-sm font-semibold mt-1">
                        {validationErrors.distance}
                    </p>
                )}
                {validationWarnings.distance && !validationErrors.distance && (
                    <p className="text-yellow-600 text-sm mt-1">
                        ⚠️ {validationWarnings.distance}
                    </p>
                )}
                {!validationErrors.distance && (
                    <p className="text-gray-500 text-xs mt-1">
                        💡 Можно ввести вручную или выбрать точку на карте
                    </p>
                )}
            </div>
            {/* WEIGHT */}
            <div className="relative mt-1">
                <label htmlFor="weight" className="font-semibold overflow-clip">
                    Вес (кг):
                </label>
                <div className={`flex items-center rounded-md mt-1 transition-all duration-300 ${
                    validationErrors.weight 
                        ? getFieldValidationClass(true, false)
                        : showWeekendWarning 
                            ? "border-4 border-red-500 animate-pulse" 
                            : getFieldValidationClass(false, validationWarnings.weight)
                }`}>
                    <input
                        type="number"
                        id="weight"
                        min={1}
                        max={100000}
                        step={10}
                        placeholder="Введите вес"
                        value={displayWeight}
                        onChange={handleWeightChange}
                        className={`min-sm:text-lg w-full p-1 rounded-md pl-2 pr-2 focus:outline-none focus:ring-2 ${
                            validationErrors.weight 
                                ? 'focus:ring-red-500' 
                                : validationWarnings.weight 
                                    ? 'focus:ring-yellow-400' 
                                    : 'focus:ring-gray-500'
                        }`}
                    />
                    <span className="pointer-events-none absolute text-gray-400" style={kgLabelStyle}>кг</span>
                </div>

                {validationErrors.weight && (
                    <p className="text-red-500 text-sm font-semibold mt-1">
                        {validationErrors.weight}
                    </p>
                )}
                {validationWarnings.weight && !validationErrors.weight && (
                    <p className="text-yellow-600 text-sm mt-1">
                        ⚠️ {validationWarnings.weight}
                    </p>
                )}
                {showWeekendWarning && !validationErrors.weight && (
                    <p className="text-red-500 text-sm font-semibold mt-1 animate-pulse">
                        Более 800кг в выходные дни +50%
                    </p>
                )}
            </div>



        </div>
    );
}

export default WeightDistanceInput;
