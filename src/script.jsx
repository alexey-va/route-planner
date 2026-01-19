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

    // Check for free delivery with payment options
    // Бесплатная доставка при оплате наличными от 45000 руб и весе до 1500 кг
    // Бесплатная доставка при оплате СБП от 55000 руб и весе до 1500 кг
    const freeDeliveryResult = applyFreeDeliveryForPayment(params, price, comments);
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
        onGazel: params.vehicle >= 0 && params.vehicle <= 3, // Все Газели (0.5т, 1т, 1.5т, 2т)
        onKamaz: params.vehicle === 5,
        isHeavyOnWeekend: params.weight > 800 && ['sunday', 'saturday'].includes(params.options.day_of_week)
    };
}

function calculateBasePrice(params, vehicleConfig, comments) {
    const distanceKm = params.distance / 1000;
    let price;

    if (params.vehicle === 5) {
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

    // Скидка применяется ко всем Газелям (0.5т, 1т, 1.5т, 2т)
    if (params.vehicle >= 0 && params.vehicle <= 3) {
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

// Бесплатная доставка при оплате наличными/СБП
// Наличные: от 45000 руб и вес до 1500 кг и машина до 1.5т
// СБП: от 55000 руб и вес до 1500 кг и машина до 1.5т
function applyFreeDeliveryForPayment(params, price, comments) {
    const maxWeightForFreeDelivery = 1500; // 1.5 тонны
    
    // Вес груза должен быть до 1.5т
    if (params.weight > maxWeightForFreeDelivery) {
        return null;
    }
    
    // Грузоподъемность машины должна быть до 1.5т (включительно)
    const vehicleConfig = vehiclesConfig[params.vehicle];
    if (vehicleConfig && vehicleConfig.max_weight > maxWeightForFreeDelivery) {
        return null;
    }
    
    const orderTotal = params.orderTotal || 0;
    
    if (params.options.pay_cash && orderTotal >= config.free_delivery_cash_min) {
        // Очищаем предыдущие комментарии - доставка бесплатная
        return { 
            price: 0, 
            description: [`Бесплатная доставка: оплата наличными, заказ от ${config.free_delivery_cash_min} руб, вес до 1.5 т, машина до 1.5 т`] 
        };
    }
    
    if (params.options.pay_sbp && orderTotal >= config.free_delivery_sbp_min) {
        // Очищаем предыдущие комментарии - доставка бесплатная
        return { 
            price: 0, 
            description: [`Бесплатная доставка: оплата СБП, заказ от ${config.free_delivery_sbp_min} руб, вес до 1.5 т, машина до 1.5 т`] 
        };
    }
    
    return null;
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
    free_delivery_cash_min: 45000,  // Мин. сумма заказа для бесплатной доставки при оплате наличными
    free_delivery_sbp_min: 55000    // Мин. сумма заказа для бесплатной доставки при оплате СБП
};

export const vehiclesConfig = {
    0: {
        name: "Газель",
        price: 50,
        price_hour: 1200,
        max_weight: 500,
        minimal_city_price: 500,  // 0.5т - мин 500
        heavy: false
    },
    1: {
        name: "Газель",
        price: 50,
        price_hour: 1200,
        max_weight: 1000,
        minimal_city_price: 1000,  // 1т - мин 1000
        heavy: false
    },
    2: {
        name: "Газель",
        price: 50,
        price_hour: 1200,
        max_weight: 1500,
        minimal_city_price: 1200,  // 1.5т - мин 1200
        heavy: false
    },
    3: {
        name: "Газель",
        price: 55,
        price_hour: 1200,
        max_weight: 2000,
        minimal_city_price: 1500,  // 2т - мин 1500
        heavy: false
    },
    4: {
        name: "Газон",
        price: 60,
        price_hour: 1200,
        max_weight: 4300,
        minimal_city_price: 2000,
        heavy: true
    },
    5: {
        name: "Камаз",
        price: 60,
        price_hour: 1200,
        max_weight: 10000,
        minimal_city_price: 2000,
        heavy: true
    }
};
