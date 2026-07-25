export const MAX_RECENT_ADDRESSES = 5;

export function normalizeRecentAddresses(addresses) {
    if (!Array.isArray(addresses)) return [];

    return addresses
        .filter((item) => (
            item &&
            typeof item.address === 'string' &&
            item.address.trim().length > 0 &&
            Array.isArray(item.coords) &&
            item.coords.length === 2 &&
            item.coords.every(Number.isFinite)
        ))
        .slice(0, MAX_RECENT_ADDRESSES);
}

export function addRecentAddress(addresses, entry) {
    const current = normalizeRecentAddresses(addresses);
    const normalizedAddress = entry?.address?.trim();
    const normalizedCoords = Array.isArray(entry?.coords)
        ? entry.coords.map(Number)
        : [];

    if (
        !normalizedAddress ||
        normalizedCoords.length !== 2 ||
        !normalizedCoords.every(Number.isFinite)
    ) {
        return current;
    }

    const comparableAddress = normalizedAddress.toLocaleLowerCase('ru-RU');
    const withoutDuplicate = current.filter(
        (item) => item.address.toLocaleLowerCase('ru-RU') !== comparableAddress
    );

    return [
        { address: normalizedAddress, coords: normalizedCoords },
        ...withoutDuplicate
    ].slice(0, MAX_RECENT_ADDRESSES);
}

export function resolveDeliveryZone(descriptions) {
    const uniqueDescriptions = [...new Set(
        (Array.isArray(descriptions) ? descriptions : [])
            .filter((description) => typeof description === 'string' && description.trim())
            .map((description) => description.trim())
    )];

    const isBridge = uniqueDescriptions.includes('За мостом');
    const isComintern = uniqueDescriptions.includes('Коминтерн');
    const regions = [];

    if (isBridge) regions.push('За мостом');
    if (isComintern) regions.push('Коминтерн');

    const firstZone = uniqueDescriptions[0] || '';
    const region = !firstZone || firstZone === 'За мостом'
        ? 'Область'
        : firstZone;

    return {
        region,
        regions,
        activeZones: uniqueDescriptions
    };
}

export function formatArrivalTime(durationSeconds, now = new Date()) {
    const seconds = Number(durationSeconds);

    if (!Number.isFinite(seconds) || seconds <= 0) return '';

    const arrival = new Date(now.getTime() + seconds * 1000);
    return arrival.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function makeRouteAlternative(index, route, activeRoute) {
    const distance = route?.properties?.get('distance');
    const duration = (
        route?.properties?.get('durationInTraffic') ||
        route?.properties?.get('duration')
    );

    return {
        id: index,
        label: index === 0 ? 'Оптимальный' : `Вариант ${index + 1}`,
        distanceText: distance?.text || '',
        distanceValue: distance?.value || 0,
        durationText: duration?.text || '',
        durationValue: duration?.value || 0,
        arrivalTime: formatArrivalTime(duration?.value),
        isActive: route === activeRoute,
        isBlocked: Boolean(route?.properties?.get('blocked'))
    };
}
