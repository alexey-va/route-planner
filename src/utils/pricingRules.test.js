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
            'Льготная доставка (розница / опт)'
        ]);
    });

    it('should include current config values in rules text', () => {
        const rules = getPricingRules();
        const allItems = rules.flatMap((section) => section.items).join('\n');

        expect(allItems).toContain(`${config.global_min_price} руб`);
        expect(allItems).toContain(`${config.delivery_retail_min} руб`);
        expect(allItems).toContain(`${vehiclesConfig[0].price} руб/км`);
        expect(allItems).toContain(`${vehiclesConfig[0].minimal_city_price} руб`);
        expect(allItems).toContain('Газон 4.3т');
        expect(allItems).toContain('80 руб/км');
        expect(allItems).toContain('55 руб/км');
        expect(allItems).toContain('20000 руб');
        expect(allItems).toContain('25000 руб');
        expect(allItems).toContain(`Розница: заказ от ${config.delivery_retail_min} руб — ${config.discounted_delivery_price} руб при весе до ${config.discounted_delivery_retail_weight_threshold} кг; ${config.discounted_delivery_retail_heavy_price} руб при весе более ${config.discounted_delivery_retail_weight_threshold} кг`);
        expect(allItems).toContain(`Опт: заказ от ${config.delivery_opt_min} руб — ${config.discounted_delivery_price} руб при любом весе в пределах грузоподъёмности`);
        expect(allItems).toContain('Утром (9:00–12:00): +600 руб');
        expect(allItems).toContain('Днём (12:00–16:00): +400 руб');
        expect(allItems).not.toContain('Бесплатная доставка');
        expect(allItems).toContain('Суббота–воскресенье: Газель при весе более 800 кг — цена × 1.5');
        expect(allItems).toContain('Суббота–воскресенье: Газон и Камаз при любом весе — цена × 2');
        expect(allItems).toContain('2300 руб');
        expect(allItems).not.toContain('Газель 2т');
        expect(allItems).toContain('не в зоне Коминтерн');
        expect(allItems).toContain('Льготная доставка в выходные не действует');
    });
});
