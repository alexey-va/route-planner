// @vitest-environment node
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { expect, it, vi } from 'vitest';

it.each([
    { vehicle: 0, day: 'weekdays', price: 700 },
    { vehicle: 2, day: 'weekdays', price: 2300 },
    { vehicle: 2, day: 'weekend', price: 4600 },
    { vehicle: 3, day: 'weekdays', price: 3440 },
    { vehicle: 3, day: 'weekend', price: 6880 },
])('renders the shipped classic bundle: vehicle $vehicle, $day → $price', async ({ vehicle, day, price }) => {
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
            distance: 10000, weight: 1, vehicle, region: 'Киров', regions: [],
            orderTotal: 25000,
            options: { retail: true, opt: false, day_of_week: day },
        };
        for (const [key, value] of Object.entries(fixture)) {
            dom.window.localStorage.setItem(key, JSON.stringify(value));
        }
        dom.window.eval(bundle);
        await vi.waitFor(() => {
            expect(errors).toEqual([]);
            const priceLabel = [...dom.window.document.querySelectorAll('span')]
                .find((span) => span.textContent === 'Стоимость:');
            expect(priceLabel?.nextElementSibling?.textContent).toBe(`${price} руб`);
        });
        const labels = [...dom.window.document.querySelectorAll('label')]
            .map((label) => label.textContent.replace(/\s+/g, ' '));
        expect(labels).toContain('Розница');
        expect(labels).toContain('Опт');
        const bodyText = dom.window.document.body.textContent.replace(/\s+/g, ' ');
        expect(bodyText).toContain('При сумме заказа от 20 000 ₽ для опта или от 25 000 ₽ для розницы.');
    } finally {
        dom.window.close();
    }
});
