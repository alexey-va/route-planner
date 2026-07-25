import FieldHint from './components/FieldHint';

function VehicleSelection({vehiclesConfig, weight, vehicle, setVehicle, showHints = false}) {
    return (
        <div className="route-vehicle-grid">
            {Object.entries(vehiclesConfig).map(([key, value]) => {
                const isDisabled = weight > value.max_weight;
                const vehicleKey = parseInt(key, 10);
                const isSelected = vehicle === vehicleKey;

                return (
                    <label
                        key={key}
                        className={`route-vehicle-card ${isSelected ? 'is-selected' : ''} ${isDisabled ? 'is-disabled' : ''}`}
                        htmlFor={`vehicle-${key}`}
                    >
                        <input
                            type="radio"
                            id={`vehicle-${key}`}
                            name="vehicleSelection"
                            disabled={isDisabled}
                            checked={isSelected}
                            onChange={() => setVehicle(vehicleKey)}
                        />
                        <span className="route-vehicle-icon" aria-hidden="true">
                            <svg viewBox="0 0 28 20" fill="none">
                                <path d="M2 3h15v11H2zM17 7h4.4l4.1 4.2V14H17z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                                <circle cx="6.2" cy="16" r="2" stroke="currentColor" strokeWidth="1.7"/>
                                <circle cx="21.8" cy="16" r="2" stroke="currentColor" strokeWidth="1.7"/>
                            </svg>
                        </span>
                        <span className="route-vehicle-copy">
                            <FieldHint
                                showHint={showHints}
                                text={`${value.name}, грузоподъемность до ${value.max_weight} кг. Стоимость: ${value.price} руб/км. Минимальная стоимость: ${value.minimal_city_price} руб`}
                            >
                                <strong>{value.name}</strong>
                            </FieldHint>
                            <small>{value.max_weight / 1000}т</small>
                        </span>
                        <span className="route-vehicle-check" aria-hidden="true">✓</span>
                    </label>
                );
            })}
        </div>
    );
}

export default VehicleSelection;
