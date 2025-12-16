import React from 'react';
import Tooltip from './components/Tooltip';

function VehicleSelection({vehiclesConfig, weight, vehicle, setVehicle}) {

    return (
        <div className="max-sm:px-0 max-sm:ml-0 ml-2 ">
            {/* VEHICLE SELECTION */}
            <div className={`max-sm:px-2 max-sm:py-2 px-4 py-2 gap-12 max-sm:gap-4 rounded-lg flex flex-row flex-wrap w-full`}>
                {Object.entries(vehiclesConfig).map(([key, value]) => {
                    const isDisabled = weight > value.max_weight;
                    const vehicleKey = parseInt(key, 10);
                    
                    return (
                        <div key={key} className="flex flex-col space-y-2 max-sm:text-sm text-md">
                            <div className="flex items-center space-x-[0.4rem]">
                                <input
                                    type="radio"
                                    id={`vehicle-${key}`}
                                    name="vehicleSelection"
                                    disabled={isDisabled}
                                    checked={vehicle === vehicleKey}
                                    onChange={() => setVehicle(vehicleKey)}
                                />
                                <label
                                    className={`flex flex-row items-center gap-1`}
                                    htmlFor={`vehicle-${key}`}>
                                    {value.name}
                                    <span
                                        className="md:translate-y-0.5 ml-1 text-gray-500 text-sm self-center">{value.max_weight / 1000}т</span>
                                    <Tooltip text={`${value.name}, грузоподъемность до ${value.max_weight} кг. Стоимость: ${value.price} руб/км. Минимальная стоимость: ${value.minimal_city_price} руб`}>
                                        <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                    </Tooltip>
                                </label>

                            </div>
                        </div>
                    );
                })}
            </div>
            {/* VEHICLE SELECTION */}
        </div>

    );
}

export default VehicleSelection;