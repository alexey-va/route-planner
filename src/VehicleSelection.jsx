import FieldHint from './components/FieldHint';

function VehicleIcon({ vehicleKey }) {
    if (vehicleKey === 0) {
        return (
            <svg viewBox="0 0 38 24" fill="none">
                <path d="M3 7h19v11H3zM22 10h6.5l5.5 5v3H22z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M25 11.5h3l3.2 3H25z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <circle cx="9" cy="19" r="2.4" fill="white" stroke="currentColor" strokeWidth="1.7"/>
                <circle cx="29" cy="19" r="2.4" fill="white" stroke="currentColor" strokeWidth="1.7"/>
            </svg>
        );
    }

    if (vehicleKey === 1) {
        return (
            <svg viewBox="0 0 38 24" fill="none">
                <path d="M2.5 3.5h21V18h-21zM23.5 8h6l5 5.5V18h-11z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M26 9.5h3l3 3.5h-6zM7 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="19" r="2.4" fill="white" stroke="currentColor" strokeWidth="1.7"/>
                <circle cx="29.5" cy="19" r="2.4" fill="white" stroke="currentColor" strokeWidth="1.7"/>
            </svg>
        );
    }

    if (vehicleKey === 2) {
        return (
            <svg viewBox="0 0 38 24" fill="none">
                <path d="M2 4h21v14H2zM25 7h6l4.5 5.5V18H25zM23 17h2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M28 9h2.5l2.8 3.5H28zM6 8h13M6 11h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="19" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="28.5" cy="19" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="34" cy="19" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 38 24" fill="none">
            <path d="M2 6h20l-2 10H5zM24 4h8l4 6v7H24z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M4 8h16M27 7h4l2.4 3.5H27zM20 16h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="19" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="25.5" cy="19" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="32.5" cy="19" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
    );
}

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
                            <VehicleIcon vehicleKey={vehicleKey} />
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
