// Route geometry can emit bounds changes again after the user zooms the map.
// Fit only once for an explicitly requested destination.
export function createRouteViewport(fitBounds) {
    let pending = false;
    return {
        requestFit() {
            pending = true;
        },
        cancelFit() {
            pending = false;
        },
        onBoundsChange(bounds) {
            if (!pending || !bounds) return;
            pending = false;
            fitBounds(bounds);
        }
    };
}
