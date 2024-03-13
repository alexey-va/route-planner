import React from 'react';

function VehicleSelection({vehiclesConfig, weight, vehicle, setVehicle}) {
    return (
        <div className="mx-2 flex flex-row gap-12 mt-4">
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
                            <label htmlFor={`vehicle-${key}`}>{value.name}</label>
                        </div>
                    </div>
                );
            })}
            {/* VEHICLE SELECTION */}
        </div>
    );
}

export default VehicleSelection;