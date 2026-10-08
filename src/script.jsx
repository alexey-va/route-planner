import { isWeekend } from './utils/dayOfWeek';

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
    const vehicle = resolveVehicle(params.vehicle, params.weight);
    const normalizedParams = vehicle === params.vehicle ? params : { ...params, vehicle };
    const conditions = extractConditions(normalizedParams);
    const vehicleConfig = vehiclesConfig[vehicle];

    // Calculate base price
    let price = calculateBasePrice(normalizedParams, vehicleConfig, comments);

    // Apply time-based adjustments
    price = applyTimeAdjustments(normalizedParams, price, comments);

    // Apply weekend adjustments
    price = applyWeekendAdjustments(conditions, price, comments);

    const discountedDelivery = applyDiscountedDelivery(normalizedParams);
    if (discountedDelivery !== null) {
        return discountedDelivery;
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

function resolveVehicle(vehicleKey, weight) {
    if (vehiclesConfig[vehicleKey]) {
        return Number(vehicleKey);
    }

    const fallback = Object.entries(vehiclesConfig)
        .find(([, vehicle]) => weight <= vehicle.max_weight);

    return Number(fallback?.[0] ?? 0);
}

function extractConditions(params) {
    const onWeekend = isWeekend(params.options.day_of_week);
    return {
        onGazel: params.vehicle === 0,
        onKamaz: params.vehicle === 3,
        isHeavyGazelOnWeekend: params.vehicle === 0 && params.weight > 800 && onWeekend,
        isTruckOnWeekend: (params.vehicle === 2 || params.vehicle === 3) && onWeekend
    };
}

function calculateBasePrice(params, vehicleConfig, comments) {
    const distanceKm = params.distance / 1000;
    const inCityZone = params.region === 'Киров' || params.region === 'Коминтерн'
        || params.regions?.includes('Коминтерн');
    const rate = !inCityZone && vehicleConfig.outside_city_price !== undefined
        ? vehicleConfig.outside_city_price
        : vehicleConfig.price;
    let price;

    if (params.vehicle === 3) {
        // Камаз has base price of 2000
        const basePrice = 2000;
        price = basePrice + distanceKm * rate * 2;
        comments.push(
            `Базовая цена: ${basePrice} руб + ${rate} руб/км × ${distanceKm.toFixed(1)} км × 2 (в две стороны) = ${price.toFixed(0)} руб`
        );
    } else {
        price = distanceKm * rate * 2;
        comments.push(
            `Базовая цена: ${rate} руб/км × ${distanceKm.toFixed(1)} км × 2 (в две стороны) = ${price.toFixed(0)} руб`
        );

        // Apply minimal price if needed
        if (price < vehicleConfig.minimal_city_price) {
            price = vehicleConfig.minimal_city_price;
            comments.push(`Минимальная стоимость доставки ${vehicleConfig.minimal_city_price} руб`);
        }
    }

    return price;
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

function applyWeekendAdjustments(conditions, price, comments) {
    const multiplier = conditions.isTruckOnWeekend
        ? config.truck_weekend_multiplier
        : conditions.isHeavyGazelOnWeekend
            ? config.weekend_multiplier
            : null;

    if (multiplier === null) {
        return price;
    }

    const newPrice = price * multiplier;
    const weekendRule = conditions.isTruckOnWeekend
        ? 'для Газона и Камаза при любом весе'
        : 'для Газели с весом более 800 кг';
    comments.push(
        `Доставка в выходные дни ${weekendRule}. Цена: ${price.toFixed(0)} руб × ${multiplier} = ${newPrice.toFixed(0)} руб`
    );
    return newPrice;
}

// Льготная доставка Газелью в Кирове; прежние ограничения и доплаты сохраняются.
function applyDiscountedDelivery(params) {
    if (params.vehicle !== 0 || params.weight > vehiclesConfig[0].max_weight) {
        return null;
    }

    if (params.options.by_time || params.options.today || isWeekend(params.options.day_of_week)) {
        return null;
    }

    const inKomintern = params.regions?.includes('Коминтерн') || params.region === 'Коминтерн';
    if (params.region !== 'Киров' || inKomintern) {
        return null;
    }

    const orderTotal = params.orderTotal || 0;
    const isRetail = params.options.retail && orderTotal >= config.delivery_retail_min;
    const isOpt = params.options.opt && orderTotal >= config.delivery_opt_min;
    if (!isRetail && !isOpt) {
        return null;
    }

    const typeLabel = isRetail ? 'розница' : 'опт';
    const minOrderSum = isRetail ? config.delivery_retail_min : config.delivery_opt_min;
    const description = [
        `Льготная доставка: ${config.discounted_delivery_price} руб, ${typeLabel}, заказ от ${minOrderSum} руб`
    ];
    const price = applyTimeAdjustments(params, config.discounted_delivery_price, description);
    return { price, description };
}

export const config = {
    by_time: 1.7,
    today: 2.0,
    morning_add: 500,
    evening_add: 300,
    right_now: 2,
    weekend_multiplier: 1.5,
    truck_weekend_multiplier: 2,
    global_min_price: 500,  // Глобальный минимум для всех доставок
    bridge_distance_add: 10,
    delivery_retail_min: 25000,
    delivery_opt_min: 20000,
    discounted_delivery_price: 700
};

export const vehiclesConfig = {
    0: {
        name: "Газель",
        price: 55,
        price_hour: 1200,
        max_weight: 1500,
        minimal_city_price: 1300,  // 1.5т
        heavy: false
    },
    2: {
        name: "Газон",
        price: 80,
        outside_city_price: 50,
        price_hour: 1200,
        max_weight: 4300,
        minimal_city_price: 2300,
        heavy: true
    },
    3: {
        name: "Камаз",
        price: 72,
        price_hour: 1200,
        max_weight: 10000,
        minimal_city_price: 2000,
        heavy: true
    }
};
