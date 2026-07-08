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
        <aside className="w-full lg:w-72 shrink-0 bg-white drop-shadow-xl rounded-md border border-gray-200 self-start">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-md">
                <h2 className="font-semibold text-lg text-gray-900">Справка по тарифам</h2>
            </div>

            <div className="px-4 py-3 space-y-3 text-sm text-gray-700">
                {Object.entries(vehiclesConfig).map(([key, vehicle]) => {
                    const label = `${vehicle.name} ${VEHICLE_LABELS[key]}`;
                    const isKamaz = Number(key) === 3;

                    return (
                        <div key={key} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="font-medium text-gray-900">{label}</div>
                            <div className="mt-1">
                                {isKamaz
                                    ? `2000 руб + ${vehicle.price} руб/км`
                                    : `${vehicle.price} руб/км`}
                            </div>
                            <div className="text-gray-500">
                                {isKamaz
                                    ? 'Базовая стоимость + км × 2 (туда-обратно)'
                                    : `Минимум: ${vehicle.minimal_city_price} руб`}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-md">
                {isUnlocked ? (
                    <div className="space-y-2">
                        <p className="text-xs text-green-700 font-medium">Расширенный доступ открыт</p>
                        <button
                            type="button"
                            onClick={onLock}
                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                        >
                            Закрыть доступ
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <label htmlFor="admin-password" className="block text-xs text-gray-600">
                            Пароль для подсказок и правил
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="off"
                        />
                        {error && (
                            <p className="text-xs text-red-600">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full px-3 py-1.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded transition-colors"
                        >
                            Войти
                        </button>
                    </form>
                )}
            </div>
        </aside>
    );
}

export default TariffReference;
