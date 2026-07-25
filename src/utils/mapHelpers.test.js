import { describe, expect, it } from 'vitest';
import {
    addRecentAddress,
    formatArrivalTime,
    makeRouteAlternative,
    normalizeRecentAddresses,
    resolveDeliveryZone
} from './mapHelpers';

describe('mapHelpers', () => {
    it('keeps valid recent addresses and limits the list', () => {
        const addresses = Array.from({ length: 7 }, (_, index) => ({
            address: `Адрес ${index}`,
            coords: [49 + index, 58 + index]
        }));

        expect(normalizeRecentAddresses(addresses)).toHaveLength(5);
    });

    it('adds an address to the top and removes case-insensitive duplicates', () => {
        const result = addRecentAddress(
            [{ address: 'Киров, Ленина 1', coords: [49.1, 58.1] }],
            { address: 'киров, ленина 1', coords: [49.2, 58.2] }
        );

        expect(result).toEqual([
            { address: 'киров, ленина 1', coords: [49.2, 58.2] }
        ]);
    });

    it('preserves pricing semantics for bridge and Comintern zones', () => {
        expect(resolveDeliveryZone(['За мостом', 'Коминтерн'])).toEqual({
            region: 'Область',
            regions: ['За мостом', 'Коминтерн'],
            activeZones: ['За мостом', 'Коминтерн']
        });
    });

    it('uses Oblast when coordinates are outside known zones', () => {
        expect(resolveDeliveryZone([])).toEqual({
            region: 'Область',
            regions: [],
            activeZones: []
        });
    });

    it('formats ETA from route duration', () => {
        const now = new Date('2026-07-25T10:00:00+03:00');
        expect(formatArrivalTime(5400, now)).toBe('11:30');
    });

    it('creates a route alternative from Yandex route properties', () => {
        const values = {
            distance: { text: '12 км', value: 12000 },
            duration: { text: '24 мин', value: 1440 },
            blocked: true
        };
        const route = {
            properties: {
                get: (key) => values[key]
            }
        };

        expect(makeRouteAlternative(0, route, route)).toMatchObject({
            label: 'Оптимальный',
            distanceText: '12 км',
            durationText: '24 мин',
            isActive: true,
            isBlocked: true
        });
    });

    it('uses the regular route duration for ETA', () => {
        const values = {
            distance: { text: '12 км', value: 12000 },
            duration: { text: '20 мин', value: 1200 }
        };
        const route = {
            properties: {
                get: (key) => values[key]
            }
        };

        expect(makeRouteAlternative(0, route, route)).toMatchObject({
            durationText: '20 мин',
            durationValue: 1200
        });
    });
});
