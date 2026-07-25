import FieldHint from './components/FieldHint';

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

            <fieldset className={`route-option-group ${validationErrors.day_of_week ? 'has-error' : ''}`}>
                <legend>День доставки</legend>
                <div className="route-option-grid">
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
                {validationErrors.day_of_week && (
                    <p className="route-field-message is-error">{validationErrors.day_of_week}</p>
                )}
            </fieldset>

            <fieldset className="route-option-group">
                <legend>Тип заказа</legend>
                <div className="route-order-row">
                    <div className="route-segmented">
                        <label className={options.retail !== false ? 'is-selected' : ''}>
                            <input
                                type="radio"
                                id="retail"
                                name="retail_opt"
                                checked={options.retail !== false}
                                onChange={() => handleOptionChange('retail')}
                            />
                            <FieldHint showHint={showHints} text="Розница. При заказе от 25 000 руб — бесплатная доставка в пределах города при соблюдении условий">
                                Розница
                            </FieldHint>
                        </label>
                        <label className={options.opt === true ? 'is-selected' : ''}>
                            <input
                                type="radio"
                                id="opt"
                                name="retail_opt"
                                checked={options.opt === true}
                                onChange={() => handleOptionChange('opt')}
                            />
                            <FieldHint showHint={showHints} text="Опт. При заказе от 25 000 руб — бесплатная доставка в пределах города при соблюдении условий">
                                Опт
                            </FieldHint>
                        </label>
                    </div>

                    <div className={`route-order-total ${validationErrors.orderTotal ? 'has-error' : ''}`}>
                        <label htmlFor="orderTotal">Сумма заказа</label>
                        <div>
                            <input
                                type="number"
                                id="orderTotal"
                                value={orderTotal || ''}
                                onChange={(event) => setOrderTotal(parseFloat(event.target.value) || 0)}
                                placeholder="0"
                            />
                            <span>₽</span>
                        </div>
                    </div>
                </div>
                {validationErrors.orderTotal && (
                    <p className="route-field-message is-error">{validationErrors.orderTotal}</p>
                )}
            </fieldset>
        </div>
    );
}

export default DeliveryOptions;
