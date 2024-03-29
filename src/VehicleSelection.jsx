import React from 'react';

function VehicleSelection({vehiclesConfig, weight, vehicle, setVehicle}) {
    return (

        <div className="ml-2  mt-2 pb-3 pr-4">
            {/* VEHICLE SELECTION */}
            <div className={`p-4 bg-gray-200 gap-12 max-sm:gap-4 rounded-lg flex flex-row flex-wrap w-full`}>
                {Object.entries(vehiclesConfig).map(([key, value]) => {
                    let isDisabled = weight > value.max_weight;
                    //console.log(vehiclesConfig[key].heavy, vehiclesConfig[key])
                    return (
                        <div key={key} className="flex flex-col space-y-2 max-sm:text-sm text-md">
                            <div className="flex items-center space-x-[0.4rem]">
                                <input
                                    type="radio"
                                    id={`vehicle-${key}`} // Ensuring unique ID
                                    name="vehicleSelection" // Same name for proper radio group behavior
                                    disabled={isDisabled}
                                    checked={vehicle === parseInt(key)}
                                    onChange={() => setVehicle(parseInt(key))}
                                />
                                <label
                                    className={`flex flex-row`}
                                    htmlFor={`vehicle-${key}`}>
                                    {value.name}
                                    <span
                                        className="md:translate-y-0.5 ml-1 text-gray-500 text-sm self-center">{value.max_weight / 1000}т</span>
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