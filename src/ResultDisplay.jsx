import { formatPrice } from './utils/formatters';

const MANUAL_DISTANCE_THRESHOLD = 99.9;

function ResultDisplay({
    distance,
    region,
    address,
    price,
    weight,
    mapDistance,
    reset,
    showComments = false
}) {
    const isManualDistance = Boolean(
        distance != null &&
        mapDistance != null &&
        Math.abs(distance - mapDistance) > MANUAL_DISTANCE_THRESHOLD
    );
    const comments = price.description?.filter(Boolean) || [];

    return (
        <section className="route-result" aria-live="polite">
            <div className="route-result-heading">
                <div>
                    <span className="route-eyebrow">Расчёт</span>
                    <h3>Итого по доставке</h3>
                </div>
                {isManualDistance && (
                    <span className="route-manual-badge">Установлено вручную</span>
                )}
            </div>

            <dl className="route-result-details">
                <div>
                    <dt>Расстояние</dt>
                    <dd>{((distance || 0) / 1000).toFixed(1)} км</dd>
                </div>
                <div>
                    <dt>Район</dt>
                    <dd>{region || 'Неизвестно'}</dd>
                </div>
                <div className="route-result-address">
                    <dt>Адрес</dt>
                    <dd title={address || ''}>{address || 'Неизвестно'}</dd>
                </div>
                <div>
                    <dt>Вес</dt>
                    <dd>{weight || 1} кг</dd>
                </div>
            </dl>

            {showComments && (
                <div className="route-result-comments">
                    <strong>Комментарии:</strong>
                    {comments.length > 0 ? (
                        <ul>
                            {comments.map((comment, index) => (
                                <li key={index}>{comment}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Нет комментариев.</p>
                    )}
                </div>
            )}

            <div className="route-price-card">
                <div>
                    <span>Стоимость доставки</span>
                    <small>Расчёт обновляется автоматически</small>
                </div>
                <strong>{formatPrice(price.price)}</strong>
            </div>

            <button
                type="button"
                data-telemetry-action="reset-calculation"
                className="route-reset-button"
                onClick={reset}
            >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7v5h5M20 17v-5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.1 16.5A7 7 0 0018.8 14M17.9 7.5A7 7 0 005.2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Сбросить
            </button>
        </section>
    );
}

export default ResultDisplay;
