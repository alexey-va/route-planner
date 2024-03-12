import React from 'react';

function WeightDistanceInput({ weight, handleWeightChange, distance, setDistance, purchaseAmount, setPurchaseAmount }) {
    return (
        <div>
            {/* WEIGHT */}
            <div>
                <label htmlFor="weight" className="font-semibold text-xl">Вес (тонн):</label>
                <input
                    type="number"
                    id="weight"
                    min={0.1}
                    step={0.1}
                    placeholder="0.1"
                    value={weight}
                    onChange={handleWeightChange}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                />
            </div>
            {/* DISTANCE */}
            <div className="mt-4">
                <label htmlFor="distance" className="font-semibold text-xl">Расстояние (км):</label>
                <input
                    type="number"
                    id="distance"
                    min={0}
                    placeholder="0"
                    step={0.1}
                    value={(distance / 1000).toFixed(2)}
                    onChange={(e) => setDistance(parseFloat(e.target.value) * 1000)}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                />
            </div>
            {/* PURCHASE AMOUNT */}
            <div className="mt-4">
                <label htmlFor="purchaseAmount" className="font-semibold text-xl">Сумма покупки (руб):</label>
                <input
                    type="number"
                    id="purchaseAmount"
                    min={0}
                    placeholder="0"
                    step={100}
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                />
            </div>
        </div>
    );
}

export default WeightDistanceInput;
