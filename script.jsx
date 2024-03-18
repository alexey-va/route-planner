export function calculate(params) {
    let comments = [];

    // If distance is 0, return -1
    if (params.distance === 0) return {
        price: -1,
        description: ["Не установлено расстояние"]
    };

    if(params.weight === 0){
        comments.push("Нулевой вес");
    }

    // check for free city delivery
    if (params.region === "Киров" && params.weight <= config.free_city_weight && !params.options.by_time && params.options.price && params.vehicle === 0) {
        if (params.distance > config.city_max_distance * 1000) {
            comments.push("Расстояние в пределах города больше 100км. Нет бесплатной доставки");
        } else {
            return {
                price: 0,
                description: ["Бесплатно в пределах города (до 1.5 тонн) при покупке от 10.000 рублей"]
            };
        }
    }

    // add comments for paid city delivery
    else if (params.region === "Киров" && params.weight <= config.free_city_weight && params.options.by_time) {
        comments.push("Платно в пределах города при срочной доставке")
    } else if(params.region === "Киров" && params.weight <= config.free_city_weight && !params.options.price){
        comments.push("Платно в пределах города при покупке менее 10,000 рублей")
    }else if(params.region === "Киров" && params.weight <= config.free_city_weight && params.options.price && params.vehicle !== 0){
        comments.push("Платно в пределах города при доставке не на Газели")
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
            comments.push("Доставка ко времени (x1.5)");
        }
    }

    if(price < vehiclesConfig[params.vehicle].minimal_city_price){
        price = vehiclesConfig[params.vehicle].minimal_city_price;
        comments.push("Минимальная стоимость доставки "+vehiclesConfig[params.vehicle].minimal_city_price+" руб");
    }

    return {
        price: price,
        description: comments
    };
}

export const config = {
    by_time: 1.5,
    right_now: 2,
    free_city_weight: 1500,
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
        minimal_city_price: 1500
    },
    2: {
        name: "Камаз",
        price: 60,
        price_hour: 1200,
        max_weight: 10000,
        minimal_city_price: 3000
    }
}