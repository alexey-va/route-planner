import React from 'react';
import {vehiclesConfig} from "../script.js";

function WeightDistanceInput({
                                 weight,
                                 handleWeightChange,
                                 distance,
                                 setDistance,
                                 purchaseAmount,
                                 setPurchaseAmount,
                                 vehicle
                             }) {

    let displayDistance = (distance / 1000).toString();
    if (displayDistance.includes('.')) {
        displayDistance = displayDistance.slice(0, displayDistance.indexOf('.') + 2);
    }

    let displaySum = (purchaseAmount).toString();
    if (displaySum.includes('.')) {
        displaySum = displaySum.slice(0, displaySum.indexOf('.') + 2);
    }

    let displayWeight = (weight).toString();
    if (displayWeight.includes('.')) {
        displayWeight = displayWeight.slice(0, displayWeight.indexOf('.'));
    }

    const minimalCityPrice = vehiclesConfig[vehicle].minimal_city_price; // Extract the minimal city price for the current vehicle


    // Calculate left offset based on the content length
    const kgLabelStyle = {
        left: `${Math.max(1, displayWeight.length) / 1.6 + 1.4}rem`,
    };

    const kmLabelStyle = {
        left: `${Math.max(1, displayDistance.length - (displayDistance.includes('.') ? 0.4 : 0)) / 1.6 + 1.4}rem`,
    };

    const rubLabelStyle = {
        left: `${(purchaseAmount ? Math.max(1, displaySum.length) / 1.6 : 0.8) + 1.4}rem`,
    };

    const handleDistanceChange = (e) => {
        let km = parseFloat(e.target.value); // Convert input from string to float
        //if (km < 0) return; // Do not update distance if input is invalid
        if (km >= 10000) km = 10000;
        if (km < 0 || isNaN(km)) km = 0;
        setDistance(km * 1000); // Convert kilometers back to meters for internal state
    };

    const handlePurchaseAmountChange = (e) => {
        let value = e.target.value;
        let amount = value === '' ? '' : parseFloat(value);
        if (amount >= 1000000000) amount = 1000000000;
        if (amount === '' || isNaN(amount)) amount = 0;
        setPurchaseAmount(amount);
    };

    const handleWeightChangeLocally = (e) => {
        let newWeight = parseFloat(e.target.value);
        let amount = newWeight;
        if (amount >= 100000) amount = 100000;
        if (amount === '' || isNaN(amount)) amount = 0;
        handleWeightChange(amount);
    }


    const sumBgColor = purchaseAmount >= vehiclesConfig[vehicle].minimal_city_price ? 'bg-green-100' : 'bg-red-100';
    const sumOutlineColor = purchaseAmount >= vehiclesConfig[vehicle].minimal_city_price ? 'border-green-400' : 'border-red-400';


    return (
        <div>
            {/* WEIGHT */}
            <div className="relative mt-2">
                <label htmlFor="weight" className="font-semibold text-xl">Вес (кг):</label>
                <div className="flex items-center border border-gray-300 rounded-md mt-2">
                    <input
                        type="number"
                        id="weight"
                        min={1}
                        max={100000}
                        step={10}
                        placeholder="Введите вес"
                        value={displayWeight}
                        onChange={handleWeightChange}
                        className="w-full p-2 rounded-md pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="pointer-events-none absolute text-gray-700" style={kgLabelStyle}>кг</span>
                </div>
            </div>
            {/* DISTANCE */}
            <div className="relative mt-4">
                <label htmlFor="distance" className="font-semibold text-xl">Расстояние (км):</label>
                <div className="flex items-center border border-gray-300 rounded-md mt-2">
                    <input
                        type="number"
                        id="distance"
                        min={0}
                        max={10000}
                        placeholder="0"
                        step="any"
                        value={displayDistance}
                        onChange={handleDistanceChange}
                        className="w-full p-2 rounded-md pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="pointer-events-none absolute text-gray-700" style={kmLabelStyle}>км</span>
                </div>
            </div>
            {/* PURCHASE AMOUNT */}
            <div className="relative mt-4">
                <label htmlFor="purchaseAmount" className="font-semibold text-xl">Сумма покупки (руб):</label>
                <div className={`${sumOutlineColor} flex items-center border border-gray-300 rounded-md mt-2`}>
                    <input
                        type="number"
                        id="purchaseAmount"
                        min={0}
                        max={1000000000}
                        placeholder="0"
                        step={100}
                        value={displaySum}
                        onChange={handlePurchaseAmountChange}
                        className={`transition-all duration-300 ${sumBgColor} w-full p-2 rounded-md pl-4 pr-4 focus:outline-none focus:ring-2 ${purchaseAmount < minimalCityPrice ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
                    />
                    <span className={`pointer-events-none absolute text-gray-700`} style={rubLabelStyle}>руб</span>
                    <span className={`pointer-events-none absolute text-gray-500 right-10`}>
                        {purchaseAmount < minimalCityPrice ? `Минимум ${minimalCityPrice} руб` : ''}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default WeightDistanceInput;
