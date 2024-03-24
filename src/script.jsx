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

    // check if weight is too heavy for any vehicle
    let atLeastOneFit = false;
    for (let key in vehiclesConfig) {
        if (params.weight <= vehiclesConfig[key].max_weight) {
            atLeastOneFit = true;
            break;
        }
    }

    if (!atLeastOneFit) {
        return {
            price: -1,
            description: ["Вес превышает грузоподъемность любой из машин"]
        };
    }

    // check for free city delivery
    if (params.region === "Киров" && params.weight <= config.free_city_weight && !params.options.by_time && params.options.price && params.vehicle === 0) {
        if (params.distance > config.city_max_distance * 1000) {
            comments.push("Расстояние в пределах города больше 100км. Нет бесплатной доставки");
        } else {
            return {
                price: 0,
                description: [!params.options.opt ?
                    "Бесплатно в пределах города (до 1.5 тонн) при покупке от 10,000 рублей" :
                    "Бесплатно в пределах города (до 1.5 тонн) при покупке от 15,000 рублей"]
            };
        }
    }

    // add comments for paid city delivery
    else if (params.region === "Киров" && params.weight <= config.free_city_weight && params.options.by_time) {
        comments.push("Платно в пределах города при срочной доставке")
    } else if(params.region === "Киров" && params.weight <= config.free_city_weight && !params.options.price){
        if(params.options.opt) comments.push("Платно в пределах города при покупке менее 15,000 рублей (оптом)")
        else comments.push("Платно в пределах города при покупке менее 10,000 рублей")
    }else if(params.region === "Киров" && params.weight <= config.free_city_weight && params.options.price && params.vehicle !== 0){
        comments.push("Платно в пределах города при доставке не на Газели")
    }

    // if not in city add comment
    if (params.region !== "Киров") comments.push(["За пределами города"]);

    // calculate price

    if(vehiclesConfig[params.vehicle].heavy && params.bridge){
        comments.push("Доставка за мостом на грузовом транспорте. Расстояние увеличено на "+config.bridge_distance_add+" км.");
        params.distance += config.bridge_distance_add * 1000;
    }

    let price = params.distance / 1000 * vehiclesConfig[params.vehicle].price * 2;
    comments.push("Базовая цена: " + (params.distance / 1000).toFixed(1) + " км × " + vehiclesConfig[params.vehicle].price + " руб/км = " + price.toFixed() + " руб");
    //comments.push("Машина: " + vehiclesConfig[params.vehicle].name);

    // minimal price adjustments
    if(price < vehiclesConfig[params.vehicle].minimal_city_price){
        price = vehiclesConfig[params.vehicle].minimal_city_price;
        comments.push("Минимальная стоимость доставки "+vehiclesConfig[params.vehicle].minimal_city_price+" руб");
    }

    // by time adjustments
    if (params.options.by_time) {
        if (params.options.right_now) {
            price *= config.right_now;
            comments.push("Срочная доставка. ");
        } else {
            if(params.time === 'day') {
                comments.push("Доставка ко времени (9:00 - 16:00). Цена: " + price.toFixed() + " руб × " + config.by_time + " = " + (price * config.by_time).toFixed() + " руб");
                price *= config.by_time;
            } else{
                comments.push("Доставка ко времени (16:00 - 9:00). Цена: " + price.toFixed() + " руб × " + config.by_time_not_day + " = " + (price * config.by_time_not_day).toFixed() + " руб");
                price *= config.by_time_not_day;
            }
        }
    }



    return {
        price: price,
        description: comments
    };
}

export const config = {
    by_time: 1.5,
    by_time_not_day: 1.7,
    right_now: 2,
    free_city_weight: 1500,
    city_max_distance: 100,
    bridge_distance_add: 10
}

export const vehiclesConfig = {
    0: {
        name: "Газель",
        price: 35,
        price_hour: 1200,
        max_weight: 1500,
        minimal_city_price: 750,
        heavy: false
    },
    1: {
        name: "Газель",
        price: 40,
        price_hour: 1200,
        max_weight: 2000,
        minimal_city_price: 900,
        heavy: false
    },
    2: {
        name: "Газон",
        price: 45,
        price_hour: 1200,
        max_weight: 5000,
        minimal_city_price: 1500,
        heavy: true
    },
    3: {
        name: "Камаз",
        price: 60,
        price_hour: 1200,
        max_weight: 10000,
        minimal_city_price: 3000,
        heavy: true
    }
}