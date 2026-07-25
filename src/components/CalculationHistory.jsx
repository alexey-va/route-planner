import { useState } from 'react';

function CalculationHistory({ history, onRemove, onClear }) {
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (priceValue) => {
        if (priceValue === 0) return 'Бесплатно';
        if (priceValue === -1 || priceValue === undefined || isNaN(priceValue)) return 'Нет';
        if (priceValue === -2) return 'Рассчитайте вручную';
        return `${priceValue.toFixed(0)} руб`;
    };

    return (
        <div className="route-popover">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="route-toolbar-button"
                aria-expanded={isOpen}
                aria-label="История расчетов"
            >
                <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
                История
                {history.length > 0 && (
                    <span className="route-toolbar-count">
                        {history.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Overlay для закрытия по клику вне области */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Панель истории */}
                    <div className="route-popover-panel route-history-panel">
                        {/* Заголовок */}
                        <div className="route-popover-header">
                            <h3>История расчётов</h3>
                            {history.length > 0 && (
                                <button
                                    onClick={() => {
                                        onClear();
                                        setIsOpen(false);
                                    }}
                                    className="route-danger-link"
                                    title="Очистить историю"
                                >
                                    Очистить
                                </button>
                            )}
                        </div>

                        {/* Список истории */}
                        <div className="route-popover-content">
                            {history.length === 0 ? (
                                <div className="route-empty-state">
                                    История пуста
                                </div>
                            ) : (
                                <ul className="route-history-list">
                                    {history.map((item) => (
                                        <li 
                                            key={item.id}
                                            className="route-history-item"
                                        >
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Итоговая цена - крупно и выделено */}
                                                        <div className="route-history-price">
                                                            {formatPrice(item.price?.price)}
                                                        </div>
                                                        
                                                        {/* Детали расчета */}
                                                        <div className="text-xs text-gray-600 space-y-0.5">
                                                            {item.region && (
                                                                <div>📍 {item.region}</div>
                                                            )}
                                                            {item.distance > 0 && (
                                                                <div>📏 {(item.distance / 1000).toFixed(1)} км</div>
                                                            )}
                                                            {item.weight > 0 && (
                                                                <div>⚖️ {item.weight} кг</div>
                                                            )}
                                                            {item.address && (
                                                                <div className="route-history-address">🏠 {item.address}</div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Время */}
                                                        <div className="text-xs text-gray-500 mt-2">
                                                            {formatDate(item.timestamp)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => onRemove(item.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Удалить из истории"
                                                            aria-label="Удалить из истории"
                                                        >
                                                            <svg 
                                                                className="w-4 h-4" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path 
                                                                    strokeLinecap="round" 
                                                                    strokeLinejoin="round" 
                                                                    strokeWidth={2} 
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CalculationHistory;
