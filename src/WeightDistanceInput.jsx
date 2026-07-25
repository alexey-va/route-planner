import { formatDistance, formatWeight } from './utils/formatters';
import { isWeekend } from './utils/dayOfWeek';

const MAX_DISTANCE_KM = 10000;
const WEEKEND_WEIGHT_WARNING_THRESHOLD = 500;

function WeightDistanceInput({
    weight,
    handleWeightChange,
    distance,
    setDistance,
    options,
    validationErrors = {},
    validationWarnings = {}
}) {
    const displayDistance = formatDistance(distance);
    const displayWeight = formatWeight(weight);
    const isWeekendDay = isWeekend(options.day_of_week);
    const showWeekendWarning =
        isWeekendDay && parseFloat(displayWeight) > WEEKEND_WEIGHT_WARNING_THRESHOLD;

    const handleDistanceChange = (event) => {
        let km = parseFloat(event.target.value);
        if (km >= MAX_DISTANCE_KM) km = MAX_DISTANCE_KM;
        if (km < 0 || isNaN(km)) km = 0;
        setDistance(km * 1000);
    };

    const fieldState = (error, warning) => {
        if (error) return 'has-error';
        if (warning) return 'has-warning';
        return '';
    };

    return (
        <div className="route-field-grid">
            <div className="route-field">
                <label htmlFor="distance">
                    Расстояние
                    <span>км</span>
                </label>
                <div className={`route-input-shell ${fieldState(
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
                        className="route-input"
                    />
                    <span className="route-input-unit">км</span>
                </div>
                {validationErrors.distance ? (
                    <p className="route-field-message is-error">{validationErrors.distance}</p>
                ) : validationWarnings.distance ? (
                    <p className="route-field-message is-warning">{validationWarnings.distance}</p>
                ) : (
                    <p className="route-field-message">С карты или вручную</p>
                )}
            </div>

            <div className="route-field">
                <label htmlFor="weight">
                    Вес груза
                    <span>кг</span>
                </label>
                <div className={`route-input-shell ${fieldState(
                    validationErrors.weight,
                    validationWarnings.weight || showWeekendWarning
                )}`}>
                    <input
                        type="number"
                        id="weight"
                        min={1}
                        max={100000}
                        step={10}
                        placeholder="Введите вес"
                        value={displayWeight}
                        onChange={handleWeightChange}
                        className="route-input"
                    />
                    <span className="route-input-unit">кг</span>
                </div>
                {validationErrors.weight ? (
                    <p className="route-field-message is-error">{validationErrors.weight}</p>
                ) : showWeekendWarning ? (
                    <p className="route-field-message is-warning">Свыше 800 кг в выходные: +50%</p>
                ) : validationWarnings.weight ? (
                    <p className="route-field-message is-warning">{validationWarnings.weight}</p>
                ) : (
                    <p className="route-field-message">До 10 000 кг</p>
                )}
            </div>
        </div>
    );
}

export default WeightDistanceInput;
