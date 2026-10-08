// @vitest-environment node
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { expect, it, vi } from 'vitest';

it('renders the shipped classic bundle and calculates discounted delivery', async () => {
    const app = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
    const asset = app.match(/src="(\/legacy\/assets\/[^\"]+\.js)"/)[1];
    const bundle = readFileSync(new URL(`../public${asset}`, import.meta.url), 'utf8');
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (error) => errors.push(error.message));
    const dom = new JSDOM('<div id="root"></div>', {
        url: 'https://route.test/', runScripts: 'outside-only', virtualConsole,
    });

    try {
        dom.window.ymaps = { ready() {} };
        const fixture = {
            distance: 10000, weight: 500, vehicle: 0, region: 'Киров', regions: [],
            orderTotal: 25000,
            options: { retail: true, opt: false, day_of_week: 'weekdays' },
        };
        for (const [key, value] of Object.entries(fixture)) {
            dom.window.localStorage.setItem(key, JSON.stringify(value));
        }
        dom.window.eval(bundle);
        await vi.waitFor(() => {
            expect(errors).toEqual([]);
            expect(dom.window.document.body.textContent).toContain('700 руб');
        });
        const labels = [...dom.window.document.querySelectorAll('label')]
            .map((label) => label.textContent.replace(/\s+/g, ' '));
        expect(labels).toContain('Розница (от 25 000 ₽)');
        expect(labels).toContain('Опт (от 20 000 ₽)');
    } finally {
        dom.window.close();
    }
});
