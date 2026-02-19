export function calculate(params) {
    const comments = [];

    // Early validation checks
    if (params.distance === 0) {
        return {
            price: -1,
            description: ["Не установлено расстояние"]
        };
    }

    if (params.weight === 0) {
        comments.push("Нулевой вес");
    }

    if (params.options.day_of_week === "none") {
        comments.push("Не выбран день недели");
        return {
            price: -1,
            description: comments
        };
    }

    // Check if weight exceeds all vehicles
    if (!canFitInAnyVehicle(params.weight)) {
        comments.push("Вес превышает грузоподъемность всех доступных машин");
        return {
            price: -2,
            description: comments
        };
    }

    // Extract conditions
    const conditions = extractConditions(params);
    const vehicleConfig = vehiclesConfig[params.vehicle];

    // Calculate base price
    let price = calculateBasePrice(params, vehicleConfig, comments);

    // Apply Komintern discount (returns early if applied)
    const kominternResult = applyKominternDiscount(params, price, comments);
    if (kominternResult !== null) {
        return kominternResult;
    }

    // Apply time-based adjustments
    price = applyTimeAdjustments(params, price, comments);

    // Apply weekend adjustments
    price = applyWeekendAdjustments(conditions.isHeavyOnWeekend, price, comments);

    // Check for free delivery with retail/opt (розница 20к, опт 25к — в пределах города или Коминтерна, без доставки к времени, машина до 1.5т)
    const freeDeliveryResult = applyFreeDeliveryForRetailOpt(params, price, comments);
    if (freeDeliveryResult !== null) {
        return freeDeliveryResult;
    }

    // Apply global minimum price
    if (price < config.global_min_price) {
        price = config.global_min_price;
        comments.push(`Минимальная стоимость доставки ${config.global_min_price} руб`);
    }

    return {
        price: price,
        description: comments
    };
}

// Helper functions
function canFitInAnyVehicle(weight) {
    return Object.values(vehiclesConfig).some(vehicle => weight <= vehicle.max_weight);
}

function extractConditions(params) {
    return {
        onGazel: params.vehicle >= 0 && params.vehicle <= 1, // Газель 1.5т, 2т
        onKamaz: params.vehicle === 3,
        isHeavyOnWeekend: params.weight > 800 && ['sunday', 'saturday'].includes(params.options.day_of_week)
    };
}

function calculateBasePrice(params, vehicleConfig, comments) {
    const distanceKm = params.distance / 1000;
    let price;

    if (params.vehicle === 3) {
        // Камаз has base price of 2000
        const basePrice = 2000;
        price = basePrice + distanceKm * vehicleConfig.price * 2;
        comments.push(
            `Базовая цена: ${basePrice} руб + ${vehicleConfig.price} руб/км × ${distanceKm.toFixed(1)} км × 2 (в две стороны) = ${price.toFixed(0)} руб`
        );
    } else {
        price = distanceKm * vehicleConfig.price * 2;
        comments.push(
            `Базовая цена: ${vehicleConfig.price} руб/км × ${distanceKm.toFixed(1)} км × 2 (в две стороны) = ${price.toFixed(0)} руб`
        );

        // Apply minimal price if needed
        if (price < vehicleConfig.minimal_city_price) {
            price = vehicleConfig.minimal_city_price;
            comments.push(`Минимальная стоимость доставки ${vehicleConfig.minimal_city_price} руб`);
        }
    }

    return price;
}

function applyKominternDiscount(params, price, comments) {
    const hasKominternDiscount = params.regions?.includes("Коминтерн") && params.advanced?.right_time_kom;

    if (!hasKominternDiscount) {
        return null;
    }

    // Скидка применяется к Газелям (1.5т, 2т)
    if (params.vehicle >= 0 && params.vehicle <= 1) {
        price *= 0.5;
        comments.push("Скидка 50% на доставку в Коминтерн в среду или пятницу");
        
        // Применяем максимум из минимума Коминтерн и глобального минимума
        const minPrice = Math.max(config.kominter_min_price, config.global_min_price);
        if (price < minPrice) {
            price = minPrice;
            comments.push(`Минимальная стоимость доставки ${minPrice} руб`);
        }

        return { price, description: comments };
    } else {
        comments.push("Скидка в Коминтерн не применяется к данному транспорту");
        return null;
    }
}

function applyTimeAdjustments(params, price, comments) {
    if (params.options.by_time) {
        const newPrice = price * config.by_time;
        comments.push(
            `Доставка к конкретному времени. Цена: ${price.toFixed(0)} руб × ${config.by_time} = ${newPrice.toFixed(0)} руб`
        );
        return newPrice;
    } else if (params.options.morning) {
        comments.push(`Доставка утром. Надбавка: ${config.morning_add} руб`);
        return price + config.morning_add;
    } else if (params.options.evening) {
        comments.push(`Доставка вечером. Надбавка: ${config.evening_add} руб`);
        return price + config.evening_add;
    } else if (params.options.today) {
        const newPrice = price * config.today;
        comments.push(
            `Доставка сегодня. Цена: ${price.toFixed(0)} руб × ${config.today} = ${newPrice.toFixed(0)} руб`
        );
        return newPrice;
    }

    return price;
}

function applyWeekendAdjustments(isHeavyOnWeekend, price, comments) {
    if (isHeavyOnWeekend) {
        const newPrice = price * config.weekend_multiplier;
        comments.push(
            `Доставка в выходные дни с весом более 800 кг. Цена: ${price.toFixed(0)} руб × ${config.weekend_multiplier} = ${newPrice.toFixed(0)} руб`
        );
        return newPrice;
    }

    return price;
}

// Бесплатная доставка при рознице/опте (только газель 1.5т или меньше)
// Розница: от 20000 руб, опт: от 25000 руб — в пределах города (Киров) или Коминтерна, без доставки к конкретному времени
// При выборе утро/вечер — бесплатно, но надбавка за время сохраняется
function applyFreeDeliveryForRetailOpt(params, price, comments) {
    const maxWeightForFreeDelivery = 1500; // 1.5 тонны

    // Только Газель 1.5т (индекс 0)
    if (params.vehicle !== 0) {
        return null;
    }

    const vehicleConfig = vehiclesConfig[params.vehicle];

    // Вес груза до 1.5т
    if (params.weight > maxWeightForFreeDelivery) {
        return null;
    }

    // Бесплатная доставка не применяется для "ко времени" и "сегодня"
    if (params.options.by_time || params.options.today) {
        return null;
    }

    // Только в пределах города (Киров) или Коминтерна
    const inCity = params.region === 'Киров';
    const inKomintern = params.regions && params.regions.includes('Коминтерн');
    if (!inCity && !inKomintern) {
        return null;
    }

    const orderTotal = params.orderTotal || 0;
    const isRetailFree = params.options.retail && orderTotal >= config.free_delivery_retail_min;
    const isOptFree = params.options.opt && orderTotal >= config.free_delivery_opt_min;

    if (!isRetailFree && !isOptFree) {
        return null;
    }

    const typeLabel = isRetailFree ? 'розница' : 'опт';
    const minOrderSum = isRetailFree ? config.free_delivery_retail_min : config.free_delivery_opt_min;

    if (params.options.morning) {
        return {
            price: config.morning_add,
            description: [
                `Бесплатная доставка: ${typeLabel}, заказ от ${minOrderSum} руб`,
                `Доставка утром (9:00-12:00). Надбавка: ${config.morning_add} руб`
            ]
        };
    }

    if (params.options.evening) {
        return {
            price: config.evening_add,
            description: [
                `Бесплатная доставка: ${typeLabel}, заказ от ${minOrderSum} руб`,
                `Доставка днём (12:00-16:00). Надбавка: ${config.evening_add} руб`
            ]
        };
    }

    return {
        price: 0,
        description: [`Бесплатная доставка: ${typeLabel}, заказ от ${minOrderSum} руб, вес до 1.5 т, машина до 1.5 т`]
    };
}

export const config = {
    by_time: 1.7,
    today: 2.0,
    morning_add: 500,
    evening_add: 300,
    kominter_min_price: 800,
    right_now: 2,
    weekend_multiplier: 1.5,
    global_min_price: 500,  // Глобальный минимум для всех доставок
    bridge_distance_add: 10,
    free_delivery_retail_min: 20000,  // Мин. сумма заказа для бесплатной доставки (розница)
    free_delivery_opt_min: 25000      // Мин. сумма заказа для бесплатной доставки (опт)
};

export const vehiclesConfig = {
    0: {
        name: "Газель",
        price: 50,
        price_hour: 1200,
        max_weight: 1500,
        minimal_city_price: 1200,  // 1.5т
        heavy: false
    },
    1: {
        name: "Газель",
        price: 55,
        price_hour: 1200,
        max_weight: 2000,
        minimal_city_price: 1500,  // 2т
        heavy: false
    },
    2: {
        name: "Газон",
        price: 60,
        price_hour: 1200,
        max_weight: 4300,
        minimal_city_price: 2000,
        heavy: true
    },
    3: {
        name: "Камаз",
        price: 60,
        price_hour: 1200,
        max_weight: 10000,
        minimal_city_price: 2000,
        heavy: true
    }
};
