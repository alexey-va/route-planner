const KILOMETER_FORMAT = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const RATE_FORMAT = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2
});

function formatKilometers(meters) {
    const numericMeters = Number(meters);
    return Number.isFinite(numericMeters)
        ? `${KILOMETER_FORMAT.format(numericMeters / 1000)} км`
        : '—';
}

function formatRate(rate) {
    return Number.isFinite(rate) ? RATE_FORMAT.format(rate) : '—';
}

function RouteZoneBreakdown({ pricing }) {
    if (!pricing || (pricing.mode !== 'split' && pricing.mode !== 'destination')) {
        return null;
    }

    const containerClassName = 'my-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-sm text-slate-700 sm:px-4';

    if (pricing.mode === 'destination') {
        return (
            <aside
                aria-label="Разбивка пробега по зонам"
                className={`${containerClassName} text-xs leading-5 text-slate-600`}
            >
                Без разбивки: весь путь по {formatRate(pricing.rate)} ₽/км. Постройте маршрут на карте для расчёта по зонам.
            </aside>
        );
    }

    const hasDistinctRates =
        Number.isFinite(pricing.insideRate) &&
        Number.isFinite(pricing.outsideRate) &&
        pricing.insideRate !== pricing.outsideRate;

    return (
        <aside
            aria-label="Разбивка пробега по зонам"
            className={containerClassName}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h4 className="font-semibold text-slate-800">Маршрут по зонам</h4>
                <p className="text-xs font-medium text-slate-600">
                    В одну сторону · {formatKilometers(pricing.totalMeters)}
                </p>
            </div>

            <dl className="mt-2 space-y-1.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2">
                    <dt className="min-w-0 text-slate-600">Киров и Коминтерн</dt>
                    <dd className="flex items-center gap-2 text-right font-medium text-slate-800">
                        <span>{formatKilometers(pricing.insideMeters)}</span>
                        {hasDistinctRates && (
                            <span className="whitespace-nowrap text-xs font-normal text-slate-500">
                                {formatRate(pricing.insideRate)} ₽/км
                            </span>
                        )}
                    </dd>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2">
                    <dt className="min-w-0 text-slate-600">За пределами зон</dt>
                    <dd className="flex items-center gap-2 text-right font-medium text-slate-800">
                        <span>{formatKilometers(pricing.outsideMeters)}</span>
                        {hasDistinctRates && (
                            <span className="whitespace-nowrap text-xs font-normal text-slate-500">
                                {formatRate(pricing.outsideRate)} ₽/км
                            </span>
                        )}
                    </dd>
                </div>
            </dl>

            <p className="mt-2 text-xs leading-4 text-slate-500">
                Для расчёта стоимости пробег считается туда-обратно.
            </p>
        </aside>
    );
}

export default RouteZoneBreakdown;
