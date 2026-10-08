import FieldHint from './components/FieldHint';
import { config } from './script.jsx';

const formatRubles = (amount) => amount.toLocaleString('ru-RU');

function DeliveryOptions({
    options,
    handleOptionChange,
    validationErrors = {},
    orderTotal = 0,
    setOrderTotal,
    showHints = false
}) {
    return (
        <div className="route-options">
            <fieldset className="route-option-group">
                <legend>Время доставки</legend>
                <div className="route-option-grid route-option-grid--three">
                    <label className={`route-option-card ${options.by_time ? 'is-selected' : ''}`}>
                        <input
                            type="checkbox"
                            id="by_time"
                            checked={options.by_time || false}
                            onChange={() => handleOptionChange('by_time')}
                        />
                        <span className="route-option-copy">
                            <FieldHint showHint={showHints} text="Доставка к конкретному времени в указанном диапазоне. Увеличивает стоимость на 70%">
                                <strong>Ко времени</strong>
                            </FieldHint>
                            <small>9:00–16:00 · +70%</small>
                        </span>
                    </label>

                    <label className={`route-option-card ${options.morning ? 'is-selected' : ''}`}>
                        <input
                            type="checkbox"
                            id="morning"
                            checked={options.morning || false}
                            onChange={() => handleOptionChange('morning')}
                        />
                        <span className="route-option-copy">
                            <FieldHint showHint={showHints} text="Доставка в утреннее время. Надбавка +500 руб">
                                <strong>Утром</strong>
                            </FieldHint>
                            <small>9:00–12:00 · +500 ₽</small>
                        </span>
                    </label>

                    <label className={`route-option-card ${options.evening ? 'is-selected' : ''}`}>
                        <input
                            type="checkbox"
                            id="evening"
                            checked={options.evening || false}
                            onChange={() => handleOptionChange('evening')}
                        />
                        <span className="route-option-copy">
                            <FieldHint showHint={showHints} text="Доставка в дневное время. Надбавка +300 руб">
                                <strong>Днём</strong>
                            </FieldHint>
                            <small>12:00–16:00 · +300 ₽</small>
                        </span>
                    </label>
                </div>
            </fieldset>

            <fieldset className="route-option-group">
                <legend>День доставки</legend>
                <div className={`route-option-grid route-day-options ${validationErrors.day_of_week ? 'has-error' : ''}`}>
                    <label className={`route-option-card route-option-card--compact ${options.day_of_week === 'weekdays' ? 'is-selected' : ''}`}>
                        <input
                            type="radio"
                            id="weekdays"
                            name="delivery-day"
                            checked={options.day_of_week === 'weekdays'}
                            onChange={() => handleOptionChange('weekdays')}
                        />
                        <span className="route-option-copy">
                            <strong>Будни</strong>
                            <small>Пн–пт</small>
                        </span>
                    </label>
                    <label className={`route-option-card route-option-card--compact ${options.day_of_week === 'weekend' ? 'is-selected' : ''}`}>
                        <input
                            type="radio"
                            id="weekend"
                            name="delivery-day"
                            checked={options.day_of_week === 'weekend'}
                            onChange={() => handleOptionChange('weekend')}
                        />
                        <span className="route-option-copy">
                            <strong>Выходные</strong>
                            <small>Сб–вс</small>
                        </span>
                    </label>
                </div>
                <p
                    className={`route-field-message route-day-message ${validationErrors.day_of_week ? 'is-error' : 'is-placeholder'}`}
                    aria-live="polite"
                >
                    {validationErrors.day_of_week || '\u00A0'}
                </p>
            </fieldset>

            <div className="route-option-group">
                <div className="route-order-row">
                    <fieldset className="route-order-type" aria-describedby="route-order-discount">
                        <legend>Тип заказа</legend>
                        <div className="route-segmented">
                            <label className={options.retail !== false ? 'is-selected' : ''}>
                                <input
                                    type="radio"
                                    id="retail"
                                    name="retail_opt"
                                    checked={options.retail !== false}
                                    onChange={() => handleOptionChange('retail')}
                                />
                                Розница
                            </label>
                            <label className={options.opt === true ? 'is-selected' : ''}>
                                <input
                                    type="radio"
                                    id="opt"
                                    name="retail_opt"
                                    checked={options.opt === true}
                                    onChange={() => handleOptionChange('opt')}
                                />
                                Опт
                            </label>
                        </div>
                    </fieldset>

                    <div
                        className={`route-order-total ${validationErrors.orderTotal ? 'has-error' : ''}`}
                        data-telemetry-action="order-total-field"
                    >
                        <label htmlFor="orderTotal">Сумма заказа</label>
                        <div>
                            <input
                                type="number"
                                id="orderTotal"
                                value={orderTotal || ''}
                                onChange={(event) => setOrderTotal(parseFloat(event.target.value) || 0)}
                                placeholder="0"
                                aria-describedby="route-order-discount"
                            />
                            <span>₽</span>
                        </div>
                    </div>
                </div>
                <p
                    className={`route-field-message ${validationErrors.orderTotal ? 'is-error' : 'is-placeholder'}`}
                    aria-live="polite"
                >
                    {validationErrors.orderTotal || '\u00A0'}
                </p>
                <div className="route-order-discount" id="route-order-discount">
                    <p><strong>Льготная доставка Газелью — от {formatRubles(config.discounted_delivery_price)} ₽</strong></p>
                    <p>
                        При сумме заказа от {formatRubles(config.delivery_opt_min)} ₽ для опта
                        {' '}или от {formatRubles(config.delivery_retail_min)} ₽ для розницы.
                    </p>
                    <details>
                        <summary>Условия льготной доставки</summary>
                        <p>
                            В зоне «Киров», кроме Коминтерна, до 1,5 т, в будни.
                            Не действует на доставку сегодня и ко времени.
                            Утром +{formatRubles(config.morning_add)} ₽, днём +{formatRubles(config.evening_add)} ₽.
                        </p>
                    </details>
                </div>
            </div>
        </div>
    );
}

export default DeliveryOptions;
