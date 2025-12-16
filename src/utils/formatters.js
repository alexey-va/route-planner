export function formatDistance(distance) {
    const displayDistance = (distance / 1000).toString();
    if (displayDistance.includes('.')) {
        return displayDistance.slice(0, displayDistance.indexOf('.') + 2);
    }
    return displayDistance;
}

export function formatWeight(weight) {
    const displayWeight = weight.toString();
    if (displayWeight.includes('.')) {
        return displayWeight.slice(0, displayWeight.indexOf('.'));
    }
    return displayWeight;
}

export function formatPrice(priceValue) {
    if (priceValue === 0) {
        return "Бесплатно";
    } else if (priceValue === -1 || priceValue === undefined || isNaN(priceValue)) {
        return "Нет";
    } else if (priceValue === -2) {
        return "Рассчитайте вручную";
    } else {
        return `${priceValue.toFixed(0)} руб`;
    }
}

