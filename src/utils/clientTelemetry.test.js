import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClientTelemetry } from './clientTelemetry';

describe('client telemetry', () => {
    let telemetry;

    beforeEach(() => {
        vi.useFakeTimers();
        sessionStorage.clear();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        telemetry?.stop();
        telemetry = undefined;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('batches page and control actions without sending field values', async () => {
        const fetchMock = vi.fn().mockResolvedValue(undefined);
        document.body.innerHTML = `
            <label for="delivery-address">Адрес</label>
            <input id="delivery-address" value="Секретный адрес" />
        `;
        telemetry = createClientTelemetry({
            windowRef: window,
            endpoint: 'https://utils.example/api/client-events',
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.start();
        document.getElementById('delivery-address').dispatchEvent(
            new Event('change', { bubbles: true }),
        );
        await vi.advanceTimersByTimeAsync(1500);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const request = fetchMock.mock.calls[0][1];
        const payload = JSON.parse(request.body);

        expect(request.mode).toBe('no-cors');
        expect(request.credentials).toBe('omit');
        expect(payload.events.map((event) => event.type)).toEqual(['page_view', 'change']);
        expect(payload.events[1]).toMatchObject({
            targetTag: 'input',
            targetKey: 'delivery-address',
        });
        expect(request.body).not.toContain('Секретный адрес');
    });

    it('silently drops a batch when the backend is unavailable', () => {
        const fetchMock = vi.fn(() => {
            throw new TypeError('offline');
        });
        telemetry = createClientTelemetry({
            windowRef: window,
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.track('click', { targetKey: 'build-route' });

        expect(() => telemetry.flush()).not.toThrow();
        expect(telemetry.pendingCount()).toBe(0);
    });

    it('tracks actions inside the legacy iframe document', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const iframeDocument = iframe.contentDocument;
        iframeDocument.body.innerHTML = '<button id="legacy-build">Построить</button>';
        telemetry = createClientTelemetry({
            windowRef: window,
            fetchImpl: vi.fn().mockResolvedValue(undefined),
            beaconImpl: undefined,
        });

        telemetry.attachDocument(iframeDocument, { uiMode: 'legacy' });
        iframeDocument.getElementById('legacy-build').click();

        expect(telemetry.pendingCount()).toBe(1);
        telemetry.flush();
    });
});
