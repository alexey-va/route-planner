const INCLUDED_ZONE_DESCRIPTIONS = new Set(['Киров', 'Коминтерн']);
const REQUIRED_ZONE_DESCRIPTIONS = ['Киров', 'Коминтерн'];
const EARTH_RADIUS_METERS = 6_371_008.8;
const COORDINATE_EPSILON = 1e-10;
const PARAMETER_EPSILON = 1e-10;

/**
 * Splits independent WGS84 route polylines against the union of the Kirov and
 * Komintern GeoJSON zones. The provider's route distance remains authoritative;
 * geometric inside/outside proportions are scaled to that distance.
 *
 * Returns null if paths, either required zone, or the provider distance is
 * invalid, or if the supplied paths have no measurable length.
 */
export function splitRouteByZones(paths, geojson, routeDistanceMeters) {
    if (!Number.isFinite(routeDistanceMeters) || routeDistanceMeters <= 0) {
        return null;
    }

    const polygons = readIncludedPolygons(geojson);
    if (!polygons || !Array.isArray(paths) || paths.length === 0) {
        return null;
    }

    let insideLength = 0;
    let outsideLength = 0;

    for (const path of paths) {
        if (!Array.isArray(path) || path.length < 2) {
            return null;
        }

        const points = path.map(readCoordinate);
        if (points.some((point) => point === null)) {
            return null;
        }

        for (let index = 1; index < points.length; index += 1) {
            const start = points[index - 1];
            const end = points[index];
            if (Math.abs(end[0] - start[0]) > 180) {
                return null;
            }

            const segmentLength = haversineDistance(start, end);
            if (!Number.isFinite(segmentLength)) {
                return null;
            }
            if (segmentLength === 0) {
                continue;
            }

            const parameters = [0, 1];
            for (const polygon of polygons) {
                for (const ring of polygon.rings) {
                    for (let ringIndex = 1; ringIndex < ring.length; ringIndex += 1) {
                        parameters.push(...segmentIntersectionParameters(
                            start,
                            end,
                            ring[ringIndex - 1],
                            ring[ringIndex]
                        ));
                    }
                }
            }

            const splitParameters = uniqueSortedParameters(parameters);
            for (let splitIndex = 1; splitIndex < splitParameters.length; splitIndex += 1) {
                const from = splitParameters[splitIndex - 1];
                const to = splitParameters[splitIndex];
                if (to - from <= PARAMETER_EPSILON) {
                    continue;
                }

                // Split the edge's haversine length by its linear GeoJSON parameter.
                const intervalLength = segmentLength * (to - from);

                const midpoint = interpolate(start, end, (from + to) / 2);
                if (isInsideUnion(midpoint, polygons)) {
                    insideLength += intervalLength;
                } else {
                    outsideLength += intervalLength;
                }
            }
        }
    }

    const measuredLength = insideLength + outsideLength;
    if (!Number.isFinite(measuredLength) || measuredLength <= 0) {
        return null;
    }

    const insideFraction = Math.min(1, Math.max(0, insideLength / measuredLength));
    const insideMeters = routeDistanceMeters * insideFraction;
    const outsideMeters = routeDistanceMeters - insideMeters;

    return {
        insideMeters,
        outsideMeters,
        totalMeters: routeDistanceMeters
    };
}

function readIncludedPolygons(geojson) {
    if (geojson?.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
        return null;
    }

    const foundDescriptions = new Set();
    const polygons = [];

    for (const feature of geojson.features) {
        const description = feature?.properties?.description;
        if (!INCLUDED_ZONE_DESCRIPTIONS.has(description)) {
            continue;
        }
        if (feature.type !== 'Feature') {
            return null;
        }

        const featurePolygons = readFeaturePolygons(feature.geometry);
        if (!featurePolygons) {
            return null;
        }

        foundDescriptions.add(description);
        polygons.push(...featurePolygons);
    }

    if (REQUIRED_ZONE_DESCRIPTIONS.some((description) => !foundDescriptions.has(description))) {
        return null;
    }
    return polygons.length > 0 ? polygons : null;
}

function readFeaturePolygons(geometry) {
    if (geometry?.type === 'Polygon') {
        const polygon = readPolygon(geometry.coordinates);
        return polygon ? [polygon] : null;
    }

    if (geometry?.type === 'MultiPolygon' && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0) {
        const polygons = geometry.coordinates.map(readPolygon);
        return polygons.some((polygon) => polygon === null) ? null : polygons;
    }

    return null;
}

function readPolygon(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
        return null;
    }

    const rings = coordinates.map(readRing);
    if (rings.some((ring) => ring === null)) {
        return null;
    }

    const outerRing = rings[0];
    for (let holeIndex = 1; holeIndex < rings.length; holeIndex += 1) {
        const hole = rings[holeIndex];
        if (pointInRing(hole[0], outerRing) !== 'inside' || ringsIntersect(hole, outerRing)) {
            return null;
        }

        for (let otherHoleIndex = 1; otherHoleIndex < holeIndex; otherHoleIndex += 1) {
            const otherHole = rings[otherHoleIndex];
            if (
                ringsIntersect(hole, otherHole)
                || pointInRing(hole[0], otherHole) !== 'outside'
                || pointInRing(otherHole[0], hole) !== 'outside'
            ) {
                return null;
            }
        }
    }

    return { rings };
}

function readRing(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length < 4) {
        return null;
    }

    const ring = coordinates.map(readCoordinate);
    if (ring.some((point) => point === null) || !pointsEqual(ring[0], ring[ring.length - 1])) {
        return null;
    }
    ring[ring.length - 1] = ring[0];

    for (let index = 1; index < ring.length - 1; index += 1) {
        if (pointsEqual(ring[index - 1], ring[index]) || Math.abs(ring[index][0] - ring[index - 1][0]) > 180) {
            return null;
        }
    }
    if (Math.abs(ring[ring.length - 1][0] - ring[ring.length - 2][0]) > 180) {
        return null;
    }

    if (Math.abs(signedRingArea(ring)) <= 1e-14 || !isSimpleRing(ring)) {
        return null;
    }
    return ring;
}

function readCoordinate(coordinate) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) {
        return null;
    }
    const longitude = coordinate[0];
    const latitude = coordinate[1];
    if (
        !Number.isFinite(longitude)
        || !Number.isFinite(latitude)
        || longitude < -180
        || longitude > 180
        || latitude < -90
        || latitude > 90
    ) {
        return null;
    }
    return [longitude, latitude];
}

function signedRingArea(ring) {
    let area = 0;
    for (let index = 1; index < ring.length; index += 1) {
        const previous = ring[index - 1];
        const current = ring[index];
        area += previous[0] * current[1] - current[0] * previous[1];
    }
    return area / 2;
}

function isSimpleRing(ring) {
    const edgeCount = ring.length - 1;
    for (let firstIndex = 0; firstIndex < edgeCount; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < edgeCount; secondIndex += 1) {
            const areAdjacent = secondIndex === firstIndex + 1
                || (firstIndex === 0 && secondIndex === edgeCount - 1);
            if (areAdjacent) {
                continue;
            }
            if (segmentsIntersect(
                ring[firstIndex],
                ring[firstIndex + 1],
                ring[secondIndex],
                ring[secondIndex + 1]
            )) {
                return false;
            }
        }
    }
    return true;
}

function ringsIntersect(firstRing, secondRing) {
    for (let firstIndex = 1; firstIndex < firstRing.length; firstIndex += 1) {
        for (let secondIndex = 1; secondIndex < secondRing.length; secondIndex += 1) {
            if (segmentsIntersect(
                firstRing[firstIndex - 1],
                firstRing[firstIndex],
                secondRing[secondIndex - 1],
                secondRing[secondIndex]
            )) {
                return true;
            }
        }
    }
    return false;
}

function segmentsIntersect(firstStart, firstEnd, secondStart, secondEnd) {
    return segmentIntersectionParameters(firstStart, firstEnd, secondStart, secondEnd).length > 0;
}

function segmentIntersectionParameters(start, end, edgeStart, edgeEnd) {
    const routeX = end[0] - start[0];
    const routeY = end[1] - start[1];
    const edgeX = edgeEnd[0] - edgeStart[0];
    const edgeY = edgeEnd[1] - edgeStart[1];
    const offsetX = edgeStart[0] - start[0];
    const offsetY = edgeStart[1] - start[1];
    const denominator = cross(routeX, routeY, edgeX, edgeY);

    if (denominator !== 0) {
        const routeParameter = cross(offsetX, offsetY, edgeX, edgeY) / denominator;
        const edgeParameter = cross(offsetX, offsetY, routeX, routeY) / denominator;
        if (isUnitParameter(routeParameter) && isUnitParameter(edgeParameter)) {
            return [clampUnitParameter(routeParameter)];
        }
        return [];
    }

    const collinearityTolerance = COORDINATE_EPSILON * Math.hypot(routeX, routeY);
    if (Math.abs(cross(offsetX, offsetY, routeX, routeY)) > collinearityTolerance) {
        return [];
    }

    const routeLengthSquared = routeX * routeX + routeY * routeY;
    if (routeLengthSquared === 0) {
        return [];
    }

    const edgeStartParameter = (offsetX * routeX + offsetY * routeY) / routeLengthSquared;
    const edgeEndParameter = (
        (edgeEnd[0] - start[0]) * routeX + (edgeEnd[1] - start[1]) * routeY
    ) / routeLengthSquared;
    const overlapStart = Math.max(0, Math.min(edgeStartParameter, edgeEndParameter));
    const overlapEnd = Math.min(1, Math.max(edgeStartParameter, edgeEndParameter));
    if (overlapEnd < overlapStart - PARAMETER_EPSILON) {
        return [];
    }
    if (overlapEnd - overlapStart <= PARAMETER_EPSILON) {
        return [clampUnitParameter((overlapStart + overlapEnd) / 2)];
    }
    return [clampUnitParameter(overlapStart), clampUnitParameter(overlapEnd)];
}

function uniqueSortedParameters(parameters) {
    const sorted = parameters
        .map(clampUnitParameter)
        .sort((left, right) => left - right);
    return sorted.filter((parameter, index) =>
        index === 0 || parameter - sorted[index - 1] > PARAMETER_EPSILON
    );
}

function isUnitParameter(parameter) {
    return Number.isFinite(parameter)
        && parameter >= -PARAMETER_EPSILON
        && parameter <= 1 + PARAMETER_EPSILON;
}

function clampUnitParameter(parameter) {
    return Math.min(1, Math.max(0, parameter));
}

function cross(firstX, firstY, secondX, secondY) {
    return firstX * secondY - firstY * secondX;
}

function pointsEqual(first, second) {
    return Math.abs(first[0] - second[0]) <= COORDINATE_EPSILON
        && Math.abs(first[1] - second[1]) <= COORDINATE_EPSILON;
}

function pointInRing(point, ring) {
    let isInside = false;
    for (let index = 1; index < ring.length; index += 1) {
        const start = ring[index - 1];
        const end = ring[index];
        if (isPointOnSegment(point, start, end)) {
            return 'boundary';
        }

        const crossesLatitude = (start[1] > point[1]) !== (end[1] > point[1]);
        if (crossesLatitude) {
            const intersectionLongitude = start[0]
                + ((point[1] - start[1]) * (end[0] - start[0])) / (end[1] - start[1]);
            if (point[0] < intersectionLongitude) {
                isInside = !isInside;
            }
        }
    }
    return isInside ? 'inside' : 'outside';
}

function isPointOnSegment(point, start, end) {
    const segmentX = end[0] - start[0];
    const segmentY = end[1] - start[1];
    const pointX = point[0] - start[0];
    const pointY = point[1] - start[1];
    const tolerance = COORDINATE_EPSILON * Math.hypot(segmentX, segmentY);
    return Math.abs(cross(segmentX, segmentY, pointX, pointY)) <= tolerance
        && point[0] >= Math.min(start[0], end[0]) - COORDINATE_EPSILON
        && point[0] <= Math.max(start[0], end[0]) + COORDINATE_EPSILON
        && point[1] >= Math.min(start[1], end[1]) - COORDINATE_EPSILON
        && point[1] <= Math.max(start[1], end[1]) + COORDINATE_EPSILON;
}

function isInsideUnion(point, polygons) {
    for (const polygon of polygons) {
        const outerStatus = pointInRing(point, polygon.rings[0]);
        if (outerStatus === 'outside') {
            continue;
        }
        if (outerStatus === 'boundary') {
            return true;
        }

        let inHole = false;
        for (let holeIndex = 1; holeIndex < polygon.rings.length; holeIndex += 1) {
            const holeStatus = pointInRing(point, polygon.rings[holeIndex]);
            if (holeStatus === 'boundary') {
                return true;
            }
            if (holeStatus === 'inside') {
                inHole = true;
                break;
            }
        }
        if (!inHole) {
            return true;
        }
    }
    return false;
}

function interpolate(start, end, parameter) {
    return [
        start[0] + (end[0] - start[0]) * parameter,
        start[1] + (end[1] - start[1]) * parameter
    ];
}

function haversineDistance(first, second) {
    const latitudeDifference = toRadians(second[1] - first[1]);
    const longitudeDifference = toRadians(second[0] - first[0]);
    const firstLatitude = toRadians(first[1]);
    const secondLatitude = toRadians(second[1]);
    const haversine = Math.sin(latitudeDifference / 2) ** 2
        + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDifference / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}
