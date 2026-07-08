import { describe, it, expect } from 'vitest';
import { getPricingRules } from './pricingRules';
import { config, vehiclesConfig } from '../script.jsx';

describe('getPricingRules', () => {
    it('should return all pricing rule sections', () => {
        const rules = getPricingRules();

        expect(rules.length).toBeGreaterThanOrEqual(5);
        expect(rules.map((section) => section.title)).toEqual([
            'Общие условия',
            'Тарифы по транспорту',
            'Доплаты за время доставки',
            'Выходные дни',
            'Бесплатная доставка (розница / опт)'
        ]);
    });

    it('should include current config values in rules text', () => {
        const rules = getPricingRules();
        const allItems = rules.flatMap((section) => section.items).join('\n');

        expect(allItems).toContain(`${config.global_min_price} руб`);
        expect(allItems).toContain(`${config.free_delivery_retail_min} руб`);
        expect(allItems).toContain('Тариф за км повышен на 10%');
        expect(allItems).toContain(`${vehiclesConfig[0].price} руб/км`);
        expect(allItems).toContain(`${vehiclesConfig[0].minimal_city_price} руб`);
        expect(allItems).toContain('не в зоне Коминтерн');
        expect(allItems).toContain('Бесплатная доставка в выходные не действует');
    });
});
