import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClientTelemetry } from './clientTelemetry';

describe('client telemetry', () => {
    let telemetry;

    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        sessionStorage.clear();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        telemetry?.stop();
        telemetry = undefined;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('batches discrete control actions', async () => {
        const fetchMock = vi.fn().mockResolvedValue(undefined);
        document.body.innerHTML = `
            <label for="delivery-window">Интервал доставки</label>
            <input id="delivery-window" type="checkbox" checked />
        `;
        telemetry = createClientTelemetry({
            windowRef: window,
            endpoint: 'https://utils.example/api/client-events',
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.start();
        document.getElementById('delivery-window').dispatchEvent(
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
            targetKey: 'delivery-window',
            fieldState: 'checked',
            changed: true,
        });
        expect(payload.events[0].pageViewId).toBeTruthy();
        expect(payload.events[0].clientId).toBeTruthy();
        expect(payload.events[0].sessionId).toBeTruthy();
        expect(payload.events[0].sequence).toBe(1);
        expect(payload.events[1].sequence).toBe(2);
        expect(payload.events[1].elapsedMs).toBeGreaterThanOrEqual(0);
        expect(payload.events[1].webdriver).toBe(false);
    });

    it('records input timing and state without the entered value', async () => {
        const fetchMock = vi.fn().mockResolvedValue(undefined);
        document.body.innerHTML = '<input id="delivery-address" value="" />';
        const input = document.getElementById('delivery-address');
        telemetry = createClientTelemetry({
            windowRef: window,
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.start();
        input.focus();
        await vi.advanceTimersByTimeAsync(700);
        input.value = 'Киров, секретная улица, 42';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(500);
        input.blur();
        telemetry.flush();

        const body = fetchMock.mock.calls[0][1].body;
        const events = JSON.parse(body).events;
        expect(events.map((event) => event.type)).toEqual([
            'page_view',
            'focus',
            'input',
            'blur',
        ]);
        expect(events[2]).toMatchObject({
            targetKey: 'delivery-address',
            fieldState: 'nonempty',
            changed: true,
        });
        expect(events[3]).toMatchObject({
            targetKey: 'delivery-address',
            fieldState: 'nonempty',
            changed: true,
            durationMs: 1200,
        });
        expect(body).not.toContain('Киров');
        expect(body).not.toContain('секретная');
    });

    it('always marks password fields as redacted', () => {
        const fetchMock = vi.fn().mockResolvedValue(undefined);
        document.body.innerHTML = '<input id="admin-password" type="password" />';
        const input = document.getElementById('admin-password');
        telemetry = createClientTelemetry({
            windowRef: window,
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.start();
        input.focus();
        input.value = 'top-secret-password';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.blur();
        telemetry.flush();

        const body = fetchMock.mock.calls[0][1].body;
        const events = JSON.parse(body).events;
        expect(events.at(-1)).toMatchObject({
            type: 'blur',
            targetKey: 'admin-password',
            fieldState: 'redacted',
            changed: true,
        });
        expect(body).not.toContain('top-secret-password');
    });

    it('coalesces continuous field activity without click and change duplicates', async () => {
        const fetchMock = vi.fn().mockResolvedValue(undefined);
        document.body.innerHTML = '<input id="weight" type="number" value="1" />';
        const input = document.getElementById('weight');
        telemetry = createClientTelemetry({
            windowRef: window,
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.start();
        input.focus();
        input.click();
        input.value = '20';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(300);
        input.value = '30';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(500);
        input.blur();
        telemetry.flush();

        const events = JSON.parse(fetchMock.mock.calls[0][1].body).events;
        expect(events.map((event) => event.type)).toEqual([
            'page_view',
            'focus',
            'input',
            'blur',
        ]);
        expect(events[2]).toMatchObject({
            targetKey: 'weight',
            changed: true,
            fieldState: 'nonempty',
        });
        expect(events[3]).toMatchObject({
            targetKey: 'weight',
            changed: true,
            durationMs: 800,
        });
    });

    it('uses semantic ancestors and ignores unmarked text clicks', () => {
        const fetchMock = vi.fn().mockResolvedValue(undefined);
        document.body.innerHTML = `
            <section data-telemetry-action="result-summary">
                <dl><dd id="result-distance">3.8 км</dd></dl>
            </section>
            <div><span id="unmarked-copy">Служебный текст</span></div>
            <button data-telemetry-action="build-route">
                <span id="button-copy">Построить</span>
            </button>
        `;
        telemetry = createClientTelemetry({
            windowRef: window,
            fetchImpl: fetchMock,
            beaconImpl: undefined,
        });

        telemetry.start();
        document.getElementById('result-distance').click();
        document.getElementById('unmarked-copy').click();
        const button = document.getElementById('button-copy').closest('button');
        button.focus();
        document.getElementById('button-copy').click();
        button.blur();
        telemetry.flush();

        const events = JSON.parse(fetchMock.mock.calls[0][1].body).events;
        expect(events.map((event) => event.type)).toEqual([
            'page_view',
            'click',
            'click',
        ]);
        expect(events.slice(1).map((event) => event.targetKey)).toEqual([
            'result-summary',
            'build-route',
        ]);
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
