export function calculate(params) {
    let comments = [];

    // If distance is 0, return -1
    if (params.distance === 0) return {
        price: -1,
        description: ["Нулевая дистанция"]
    };

    if(params.weight === 0){
        comments.push("Нулевой вес");
    }


    // check for minimal purchase amount
    let minimal_city_price = vehiclesConfig[params.vehicle].minimal_city_price;
    if (params.purchaseAmount < minimal_city_price) {
        return {
            price: -1,
            description: ["Минимальная сумма покупки не достигнута (" + minimal_city_price + " руб)"]
        };
    }

    // check for free city delivery
    if (params.region === "Киров" && params.weight <= config.free_city_weight && !params.options.by_time) {
        if (params.distance > config.city_max_distance * 1000) {
            comments.push("Расстояние в пределах города больше 100км. Нет бесплатной доставки");
        } else {
            return {
                price: 0,
                description: ["Бесплатно в пределах города (до 1.5 тонн)"]
            };
        }
    }
    // add comments for paid city delivery
    else if (params.region === "Киров" && params.weight <= config.free_city_weight && params.options.by_time) {
        comments.push("Платно в пределах города при срочной доставке")
    }

    // if not in city add comment
    if (params.region !== "Киров") comments.push(["За пределами города"]);

    // calculate price
    let price = params.distance / 1000 * vehiclesConfig[params.vehicle].price * 2;
    comments.push("Машина: " + vehiclesConfig[params.vehicle].name);
    if (params.options.by_time) {
        if (params.options.right_now) {
            price *= config.right_now;
            comments.push("Срочная доставка (x2)");
        } else {
            price *= config.by_time;
            comments.push("Доставка по времени (x1.5)");
        }
    }
    return {
        price: price,
        description: comments
    };
}

export const config = {
    by_time: 1.5,
    right_now: 2,
    free_city_weight: 1.5,
    city_max_distance: 100
}

export const vehiclesConfig = {
    0: {
        name: "Газель",
        price: 35,
        price_hour: 1200,
        max_weight: 1500,
        minimal_city_price: 750
    },
    1: {
        name: "Газон",
        price: 45,
        price_hour: 1200,
        max_weight: 5000,
        minimal_city_price: 2400
    },
    2: {
        name: "Камаз",
        price: 60,
        price_hour: 1200,
        max_weight: 8000,
        minimal_city_price: 3000
    }
}