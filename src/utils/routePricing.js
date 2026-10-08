// A manually edited distance must not reuse the split of a different route.
function matchingSplit(split, distance) {
    if (!split || !Number.isFinite(distance) || distance <= 0) return null;
    const { insideMeters, outsideMeters, totalMeters } = split;
    if (![insideMeters, outsideMeters, totalMeters].every(Number.isFinite)
        || insideMeters < 0 || outsideMeters < 0 || totalMeters <= 0
        || Math.abs(totalMeters - distance) > 0.01
        || Math.abs(insideMeters + outsideMeters - totalMeters) > 0.01) {
        return null;
    }
    return { insideMeters, outsideMeters, totalMeters };
}

export function getRoutePricing(params, vehicle) {
    const split = matchingSplit(params.routeZoneSplit, params.distance);
    if (split) {
        return {
            mode: 'split',
            ...split,
            insideRate: vehicle.price,
            outsideRate: vehicle.outside_city_price ?? vehicle.price,
        };
    }

    if (vehicle.outside_city_price === undefined) return null;
    const inCityZone = params.region === 'Киров' || params.region === 'Коминтерн'
        || params.regions?.includes('Коминтерн');
    return {
        mode: 'destination',
        totalMeters: params.distance,
        rate: inCityZone ? vehicle.price : vehicle.outside_city_price,
    };
}
