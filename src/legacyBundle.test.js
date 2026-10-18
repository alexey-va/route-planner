// @vitest-environment node
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { expect, it, vi } from 'vitest';

it.each([
    { vehicle: 0, day: 'weekdays', price: 800, orderTotal: 20000 },
    { vehicle: 0, day: 'weekdays', price: 1300, orderTotal: 20000, weight: 501, distance: 30000 },
    { vehicle: 0, day: 'weekdays', price: 800, orderType: 'opt', weight: 1500 },
    { vehicle: 0, day: 'weekdays', price: 1400, time: 'morning' },
    { vehicle: 0, day: 'weekdays', price: 1200, orderType: 'opt', time: 'evening' },
    { vehicle: 2, day: 'weekdays', price: 2300 },
    { vehicle: 2, day: 'weekend', price: 4600 },
    { vehicle: 3, day: 'weekdays', price: 3440 },
    { vehicle: 3, day: 'weekend', price: 6880 },
    { vehicle: 2, day: 'weekdays', price: 4900, distance: 40000,
        routeZoneSplit: { insideMeters: 10000, outsideMeters: 30000, totalMeters: 40000 } },
])('renders the shipped classic bundle: vehicle $vehicle, $day → $price', async ({
    vehicle, day, price, distance = 10000, routeZoneSplit = null,
    weight = 500, orderTotal = 25000, orderType = 'retail', time = null,
}) => {
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
            distance, routeZoneSplit, weight, vehicle, region: 'Киров', regions: [], orderTotal,
            options: {
                retail: orderType === 'retail', opt: orderType === 'opt', day_of_week: day,
                morning: time === 'morning', evening: time === 'evening',
            },
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
        expect(bodyText).toContain('Розница от 20 000 ₽ — доставка 800 ₽ до 500 кг, свыше — 1 300 ₽.');
        expect(bodyText).toContain('Опт от 25 000 ₽ — доставка 800 ₽ при любом весе до 1 500 кг.');
        expect(bodyText).toContain('Утром +600 ₽, днём +400 ₽.');
        if (routeZoneSplit) {
            expect(bodyText).toContain('Маршрут по зонам');
            expect(bodyText).toContain('10,00 км');
            expect(bodyText).toContain('30,00 км');
        }
    } finally {
        dom.window.close();
    }
});
