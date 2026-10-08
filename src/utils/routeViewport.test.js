import { describe, expect, it, vi } from 'vitest';
import { createRouteViewport } from './routeViewport';

describe('route viewport', () => {
    const firstRoute = [[49.5, 58.5], [49.7, 58.7]];
    const nextRoute = [[49.4, 58.4], [49.8, 58.8]];

    it('keeps manual zoom after the requested route has fitted', () => {
        const fitBounds = vi.fn();
        const viewport = createRouteViewport(fitBounds);
        viewport.requestFit();
        viewport.onBoundsChange(firstRoute);
        // Rendering or alternative geometry updates must not reset the viewport.
        viewport.onBoundsChange(firstRoute);
        viewport.onBoundsChange(nextRoute);
        expect(fitBounds).toHaveBeenCalledExactlyOnceWith(firstRoute);
    });

    it('waits for bounds and fits again when a new destination is requested', () => {
        const fitBounds = vi.fn();
        const viewport = createRouteViewport(fitBounds);
        viewport.requestFit();
        viewport.onBoundsChange(null);
        expect(fitBounds).not.toHaveBeenCalled();
        viewport.onBoundsChange(firstRoute);
        viewport.requestFit();
        viewport.onBoundsChange(nextRoute);
        expect(fitBounds.mock.calls).toEqual([[firstRoute], [nextRoute]]);
    });

    it('ignores late route bounds after reset or a failed request', () => {
        const fitBounds = vi.fn();
        const viewport = createRouteViewport(fitBounds);
        viewport.requestFit();
        viewport.cancelFit();
        viewport.onBoundsChange(firstRoute);
        expect(fitBounds).not.toHaveBeenCalled();
    });
});
