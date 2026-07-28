import { useState } from 'react';
import { ADMIN_PASSWORD } from '../constants/adminAccess';
import { VEHICLE_LABELS } from '../utils/pricingRules';

function TariffReference({ vehiclesConfig, isUnlocked, onUnlock, onLock }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setError('');
            setPassword('');
            onUnlock();
            return;
        }
        setError('Неверный пароль');
    };

    return (
        <aside className="route-card route-tariff-card">
            <div className="route-tariff-header">
                <div>
                    <span className="route-eyebrow">Быстрая справка</span>
                    <h2>Тарифы автомобилей</h2>
                </div>
                <span className="route-tariff-note">км считаются туда-обратно</span>
            </div>

            <div className="route-tariff-grid">
                {Object.entries(vehiclesConfig).map(([key, vehicle]) => {
                    const label = `${vehicle.name} ${VEHICLE_LABELS[key]}`;
                    const isKamaz = Number(key) === 3;

                    return (
                        <div key={key} className="route-tariff-item">
                            <div className="route-tariff-item-title">
                                <span>{label}</span>
                                <strong>{vehicle.price} ₽/км</strong>
                            </div>
                            <p>
                                {isKamaz
                                    ? 'База 2 000 ₽ + пробег'
                                    : `Минимум ${vehicle.minimal_city_price.toLocaleString('ru-RU')} ₽`}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="route-access-panel">
                {isUnlocked ? (
                    <>
                        <div>
                            <span className="route-access-status">Расширенные подсказки включены</span>
                            <small>Доступны комментарии и правила расчёта</small>
                        </div>
                        <button
                            type="button"
                            data-telemetry-action="lock-tariff-hints"
                            onClick={onLock}
                        >
                            Закрыть доступ
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="admin-password">Расширенные подсказки</label>
                            <small>Введите пароль сотрудника</small>
                        </div>
                        <div className="route-access-input">
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Пароль"
                                autoComplete="off"
                                aria-invalid={Boolean(error)}
                            />
                            <button type="submit" data-telemetry-action="unlock-tariff-hints">
                                Открыть
                            </button>
                        </div>
                        {error && <p className="route-field-message is-error">{error}</p>}
                    </form>
                )}
            </div>
        </aside>
    );
}

export default TariffReference;
