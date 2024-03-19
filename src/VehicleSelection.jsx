import React from 'react';

function VehicleSelection({vehiclesConfig, weight, vehicle, setVehicle}) {
    return (
        <div className="mx-2 flex flex-row gap-12 mt-2 pb-3">
            {/* VEHICLE SELECTION */}
            {Object.entries(vehiclesConfig).map(([key, value]) => {
                let isDisabled = weight > value.max_weight;
                return (
                    <div key={key} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
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
                                {vehicle !== 0 && key == vehicle ? <span className={`text-nowrap absolute pl-2 self-center translate-y-5 -translate-x-7 text-[0.7rem] text-red-600`}>Рассчитайте дистанцию вручную</span> : ""}
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