// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readRouteZoneSplit } from './routeZoneAdapter';

const zones = JSON.parse(readFileSync(new URL('../../data.geojson', import.meta.url), 'utf8'));
const makeRoute = (coordinates) => ({
    getPaths: () => ({ each: (callback) => callback({ properties: { get: () => coordinates } }) }),
    properties: { get: () => ({ value: 10000 }) },
});

describe('Yandex driving Path adapter', () => {
    it('uses full longlat path geometry and provider distance, not destination coordinates', () => {
        const split = readRouteZoneSplit(makeRoute([[49.63, 58.58], [49.64, 58.59]]), zones);
        expect(split).toEqual({ insideMeters: 10000, outsideMeters: 0, totalMeters: 10000 });
    });

    it('leaves unavailable geometry or zones unknown instead of making the whole route outside', () => {
        expect(readRouteZoneSplit(makeRoute(undefined), zones)).toBeNull();
        expect(readRouteZoneSplit(makeRoute([[49.63, 58.58], [49.64, 58.59]]), null)).toBeNull();
        expect(readRouteZoneSplit(null, zones)).toBeNull();
    });
});
