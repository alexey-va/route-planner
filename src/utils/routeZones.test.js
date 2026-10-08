import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { splitRouteByZones } from './routeZones';

const ring = ([minLon, minLat, maxLon, maxLat]) => [
    [minLon, minLat],
    [maxLon, minLat],
    [maxLon, maxLat],
    [minLon, maxLat],
    [minLon, minLat]
];

const polygon = (outerBounds, holeBounds = []) => ({
    type: 'Polygon',
    coordinates: [ring(outerBounds), ...holeBounds.map(ring)]
});

const feature = (description, geometry) => ({
    type: 'Feature',
    properties: { description },
    geometry
});

const zones = (kirovGeometry = polygon([-1, -1, 1, 1]), cominternGeometry = polygon([2, 2, 3, 3])) => ({
    type: 'FeatureCollection',
    features: [
        feature('Киров', kirovGeometry),
        feature('Коминтерн', cominternGeometry)
    ]
});

describe('splitRouteByZones', () => {
    it('splits a crossing segment and counts overlapping zones as one union', () => {
        const result = splitRouteByZones(
            [[[-2, 0], [2, 0]]],
            zones(polygon([-1, -1, 1, 1]), polygon([0, -1, 2, 1])),
            1000
        );

        expect(result).not.toBeNull();
        expect(result.insideMeters).toBeCloseTo(750, 6);
        expect(result.outsideMeters).toBeCloseTo(250, 6);
        expect(result.totalMeters).toBe(1000);
    });

    it('counts disjoint MultiPolygon parts and repeated route entry once', () => {
        const kirov = {
            type: 'MultiPolygon',
            coordinates: [
                polygon([-1, -1, -0.5, 1]).coordinates,
                polygon([0.5, -1, 1, 1]).coordinates
            ]
        };
        const result = splitRouteByZones([[[-2, 0], [2, 0]]], zones(kirov), 1000);

        expect(result.insideMeters).toBeCloseTo(250, 6);
        expect(result.outsideMeters).toBeCloseTo(750, 6);
    });

    it('subtracts polygon holes while treating the hole boundary as inside', () => {
        const result = splitRouteByZones(
            [[[-2, 0], [2, 0]]],
            zones(polygon([-1, -1, 1, 1], [[-0.5, -0.5, 0.5, 0.5]])),
            1000
        );

        expect(result.insideMeters).toBeCloseTo(250, 6);
        expect(result.outsideMeters).toBeCloseTo(750, 6);

        const alongHoleBoundary = splitRouteByZones(
            [[[-0.5, -0.5], [0.5, -0.5]]],
            zones(polygon([-1, -1, 1, 1], [[-0.5, -0.5, 0.5, 0.5]])),
            100
        );
        expect(alongHoleBoundary.insideMeters).toBe(100);
        expect(alongHoleBoundary.outsideMeters).toBe(0);
    });

    it('counts a route segment along the outer polygon boundary as inside', () => {
        const result = splitRouteByZones([[[-2, 1], [2, 1]]], zones(), 1000);

        expect(result.insideMeters).toBeCloseTo(500, 6);
        expect(result.outsideMeters).toBeCloseTo(500, 6);
    });

    it('does not connect independent route paths', () => {
        const paths = [
            [[-2, 2], [-1.5, 0]],
            [[1.5, 0], [2, 2]]
        ];
        const result = splitRouteByZones(paths, zones(), 1000);

        expect(result.insideMeters).toBe(0);
        expect(result.outsideMeters).toBe(1000);
    });

    it('weights independent path lengths with haversine distance at their latitudes', () => {
        const result = splitRouteByZones(
            [
                [[-40, 0], [40, 0]],
                [[0, 60], [80, 60]]
            ],
            zones(polygon([-40, -1, 40, 1])),
            1000
        );

        expect(result.insideMeters).toBeCloseTo(680.883, 3);
        expect(result.outsideMeters).toBeCloseTo(319.117, 3);
    });

    it('treats the unrelated За мостом feature as outside', () => {
        const geojson = zones();
        geojson.features.push(feature('За мостом', polygon([10, 10, 11, 11])));
        const result = splitRouteByZones([[[10.1, 10.5], [10.9, 10.5]]], geojson, 100);

        expect(result.insideMeters).toBe(0);
        expect(result.outsideMeters).toBe(100);
    });

    it('splits a route against the real Kirov and Komintern polygons', () => {
        const actualZones = JSON.parse(readFileSync(resolve(process.cwd(), 'data.geojson'), 'utf8'));
        const result = splitRouteByZones([[[49.5, 58.6], [49.75, 58.6]]], actualZones, 12345);

        expect(result).not.toBeNull();
        expect(result.insideMeters).toBeGreaterThan(0);
        expect(result.outsideMeters).toBeGreaterThan(0);
        expect(result.insideMeters + result.outsideMeters).toBeCloseTo(result.totalMeters, 9);
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, '1000'])(
        'returns null for invalid route distance %s',
        (routeDistanceMeters) => {
            expect(splitRouteByZones([[[-2, 0], [2, 0]]], zones(), routeDistanceMeters)).toBeNull();
        }
    );

    it.each([
        null,
        [],
        [[]],
        [[[0, 0]]],
        [[[0, 0], [0, 0]]],
        [[[181, 0], [0, 0]]]
    ])('returns null for invalid or zero-length paths', (paths) => {
        expect(splitRouteByZones(paths, zones(), 1000)).toBeNull();
    });

    it('returns null when either required zone is missing or malformed', () => {
        const missingKomintern = {
            type: 'FeatureCollection',
            features: [feature('Киров', polygon([-1, -1, 1, 1]))]
        };
        const malformedKomintern = zones();
        malformedKomintern.features[1].geometry = { type: 'Point', coordinates: [2.5, 2.5] };

        expect(splitRouteByZones([[[-2, 0], [2, 0]]], missingKomintern, 1000)).toBeNull();
        expect(splitRouteByZones([[[-2, 0], [2, 0]]], malformedKomintern, 1000)).toBeNull();

        const unclosedKirov = zones();
        unclosedKirov.features[0].geometry.coordinates = [[[-1, -1], [1, -1], [1, 1], [-1, 1]]];
        expect(splitRouteByZones([[[-2, 0], [2, 0]]], unclosedKirov, 1000)).toBeNull();
    });
});
