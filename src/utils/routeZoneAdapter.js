import { splitRouteByZones } from './routeZones';

// Both the modern MultiRoute and the classic RoutePanel expose driving Paths.
export function readRouteZoneSplit(route, geojson) {
    try {
        const paths = [];
        route.getPaths().each((path) => paths.push(path.properties.get('coordinates')));
        return splitRouteByZones(paths, geojson, route.properties.get('distance')?.value);
    } catch {
        // Missing route geometry must not become an invented zero-length city leg.
        return null;
    }
}
