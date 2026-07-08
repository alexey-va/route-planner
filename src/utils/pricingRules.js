import { config, vehiclesConfig } from '../script.jsx';

const VEHICLE_LABELS = {
    0: '1.5т',
    1: '2т',
    2: '4.3т',
    3: '10т'
};

function formatVehicleBaseRule(vehicleKey, vehicle) {
    const label = `${vehicle.name} ${VEHICLE_LABELS[vehicleKey]}`;

    if (Number(vehicleKey) === 3) {
        return {
            title: label,
            items: [
                `Базовая стоимость: 2000 руб + ${vehicle.price} руб/км × расстояние (км) × 2 (туда-обратно)`,
                `Грузоподъёмность до ${vehicle.max_weight} кг`
            ]
        };
    }

    return {
        title: label,
        items: [
            `Тариф: ${vehicle.price} руб/км × расстояние (км) × 2 (туда-обратно)`,
            `Минимальная стоимость: ${vehicle.minimal_city_price} руб`,
            `Грузоподъёмность до ${vehicle.max_weight} кг`
        ]
    };
}

export function getPricingRules() {
    const vehicleRules = Object.entries(vehiclesConfig).map(([key, vehicle]) =>
        formatVehicleBaseRule(key, vehicle)
    );

    return [
        {
            title: 'Общие условия',
            items: [
                'Для расчёта нужны расстояние, вес груза и день недели',
                `Глобальный минимум доставки: ${config.global_min_price} руб (если итог ниже после всех надбавок)`,
                'Расстояние считается в обе стороны (× 2)'
            ]
        },
        {
            title: 'Тарифы по транспорту',
            items: [
                'Тариф за км повышен на 10% от прежних ставок (50→55, 60→66, 65→72 руб/км), округление вверх до целых рублей',
                ...vehicleRules.flatMap((rule) => [
                    rule.title,
                    ...rule.items.map((item) => `  • ${item}`)
                ])
            ]
        },
        {
            title: 'Доплаты за время доставки',
            items: [
                `К конкретному времени: цена × ${config.by_time}`,
                `Сегодня: цена × ${config.today}`,
                `Утром (9:00–12:00): +${config.morning_add} руб`,
                `Днём (12:00–16:00): +${config.evening_add} руб`,
                'Опции времени взаимоисключающие; «ко времени» имеет приоритет'
            ]
        },
        {
            title: 'Выходные дни',
            items: [
                `Суббота–воскресенье: при весе более 800 кг цена × ${config.weekend_multiplier}`,
                'Бесплатная доставка в выходные не действует'
            ]
        },
        {
            title: 'Бесплатная доставка (розница / опт)',
            items: [
                `Заказ от ${config.free_delivery_retail_min} руб (розница и опт)`,
                'Только Газель 1.5т, вес груза до 1500 кг',
                'Только в пределах города (Киров), не в зоне Коминтерн',
                'Не действует: выходные, «ко времени», «сегодня»',
                `При выборе утра или дня — только надбавка за время (${config.morning_add} / ${config.evening_add} руб)`
            ]
        }
    ];
}
