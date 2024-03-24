import React from 'react';

function VehicleSelection({vehiclesConfig, weight, vehicle, setVehicle}) {
    return (
        <div className="mx-2 flex flex-row flex-wrap gap-12 max-sm:gap-4 mt-2 pb-3">
            {/* VEHICLE SELECTION */}
            {Object.entries(vehiclesConfig).map(([key, value]) => {
                let isDisabled = weight > value.max_weight;
                //console.log(vehiclesConfig[key].heavy, vehiclesConfig[key])
                return (
                    <div key={key} className="flex flex-col space-y-2">
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
                                <span className="ml-2 text-gray-500 text-sm self-center translate-y-0.5">{value.max_weight/1000}т</span>
                            </label>

                        </div>
                    </div>
                );
            })}
            {/* VEHICLE SELECTION */}
        </div>
    );
}

export default VehicleSelection;