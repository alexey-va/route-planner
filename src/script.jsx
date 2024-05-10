export function calculate(params) {
    let comments = [];

    // If distance is 0, return -1
    if (params.distance === 0) return {
        price: -1,
        description: ["Не установлено расстояние"]
    };

    if (params.weight === 0) {
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
        comments.push("Вес превышает грузоподъемность всех доступных машин");
        return {
            price: -2,
            description: comments
        };
    }





    let inCity = params.region === "Киров";
    let inCityWeight = params.weight <= config.free_city_weight;
    let fixedTime = params.options.by_time;
    let enoughPrice = params.options.price;
    let onGazel = params.vehicle === 0;
    let onKamaz = params.vehicle === 3;
    let isCement = params.options.cement;

    // check for free city delivery
    if (inCity && inCityWeight && !fixedTime && enoughPrice && onGazel && !isCement) {
        if (params.distance > config.city_max_distance * 1000) {
            comments.push("Расстояние в пределах города больше 100км. Нет бесплатной доставки");
        } else {
            let price = 0;
            if (params.options.opt) {
                price = 0;
                comments.push("Бесплатно в пределах города (до 1.5 тонн) при покупке от 15,000 рублей (оптом)");
            } else {
                price = 0;
                comments.push("Бесплатно в пределах города (до 1.5 тонн) при покупке от 10,000 рублей");
            }
            if(params.options.morning){
                price += config.morning_add;
                comments.push("Доставка утром. Надбавка: " + price.toFixed() + " руб");
            }else if(params.options.evening){
                price += config.evening_add;
                comments.push("Доставка вечером. Надбавка: " + price.toFixed() + " руб");
            }
            return {
                price: price,
                description: comments
            };
        }
    }

    // add comments for paid city delivery
    else if (inCity && inCityWeight && fixedTime) {
        comments.push("Платно при выборе времени доставки");
    } else if (inCity && inCityWeight && !enoughPrice) {
        if (params.options.opt) comments.push("Платно при покупке менее 15,000 рублей (оптом)")
        else comments.push("Платно при покупке менее 10,000 рублей")
    } else if (inCity && inCityWeight && enoughPrice && !onGazel) {
        comments.push("Платно при доставке не на Газели")
    } else if (inCity && isCement) {
        comments.push("Платно при доставке цемента или ЦПС более 15 шт")
    }

    // if not in city add comment
    //if (params.region !== "Киров") comments.push(["За пределами города"]);

    // calculate price

/*    if (vehiclesConfig[params.vehicle].heavy && params.bridge) {
        //comments.push("Доставка за мостом на грузовом транспорте. Расстояние увеличено на " + config.bridge_distance_add + " км.");
        //params.distance += config.bridge_distance_add * 1000;
    }*/



    let price = params.distance / 1000 * vehiclesConfig[params.vehicle].price * 2;
    console.log(params.options)
    if(params.regions && params.regions.includes("Коминтерн") ){
        if(params.vehicle === 0 || params.vehicle === 1) {
            price = 700;
            comments.push("Доставка в Коминтерн на газели: 700 руб");
        }
        else if(params.vehicle === 2) {
            price = 800;
            comments.push("Доставка в Коминтерн на газоне: 1000 руб");
        } else if(params.vehicle === 3) {
            price = 1200;
            comments.push("Доставка в Коминтерн на камазе: 1200 руб");
        }
    } else{
        if(onKamaz){
            price = 1500 + params.distance / 1000 * vehiclesConfig[params.vehicle].price;
            comments.push("Базовая цена: 1500 руб + " + vehiclesConfig[params.vehicle].price + " руб/км × "+ (params.distance / 1000).toFixed(1) + " км" +  " = " + price.toFixed() + " руб");
        } else{
            comments.push("Базовая цена: " +vehiclesConfig[params.vehicle].price + " руб/км × "+ (params.distance / 1000).toFixed(1) + " км" +  " = " + price.toFixed() + " руб");

            // minimal price adjustments before time adjustment
            if (price < vehiclesConfig[params.vehicle].minimal_city_price) {
                price = vehiclesConfig[params.vehicle].minimal_city_price;
                comments.push("Минимальная стоимость доставки " + vehiclesConfig[params.vehicle].minimal_city_price + " руб");
            }
        }
    }






    // by time adjustments
    if (params.options.by_time) {
        comments.push("Доставка к конкретному времени. Цена: " + price.toFixed() + " руб × " + config.by_time + " = " + (price * config.by_time).toFixed() + " руб");
        price *= config.by_time;
    } else if(params.options.morning) {
        comments.push("Доставка утром. Надбавка: " + config.morning_add + " руб");
        price += config.morning_add;
    } else if(params.options.evening) {
        comments.push("Доставка вечером. Надбавка: " + config.evening_add + " руб");
        price += config.evening_add;
    }


    return {
        price: price,
        description: comments
    };
}

export const config = {
    by_time: 1.7,
    morning_add: 500,
    evening_add: 300,
    right_now: 2,
    free_city_weight: 1500,
    city_max_distance: 100,
    bridge_distance_add: 10
}

export const vehiclesConfig = {
    0: {
        name: "Газель",
        price: 40,
        price_hour: 1200,
        max_weight: 1500,
        minimal_city_price: 750,
        heavy: false
    },
    1: {
        name: "Газель",
        price: 45,
        price_hour: 1200,
        max_weight: 2000,
        minimal_city_price: 900,
        heavy: false
    },
    2: {
        name: "Газон",
        price: 50,
        price_hour: 1200,
        max_weight: 5000,
        minimal_city_price: 1500,
        heavy: true
    },
    3: {
        name: "Камаз",
        price: 100,
        price_hour: 1200,
        max_weight: 10000,
        minimal_city_price: 1500,
        heavy: true
    }
}