import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TariffReference from './TariffReference';
import { config, vehiclesConfig } from '../script.jsx';

const formatRubles = (amount) => amount.toLocaleString('ru-RU');
const normalizeSpaces = (text) => text.replace(/\s+/g, ' ').trim();

describe('TariffReference', () => {
    it('shows current delivery thresholds and Gazelle price without unlocking hints', () => {
        const { container } = render(
            <TariffReference
                vehiclesConfig={vehiclesConfig}
                isUnlocked={false}
                onUnlock={vi.fn()}
                onLock={vi.fn()}
            />
        );

        const note = container.querySelector('.route-tariff-discounted-note');
        const noteText = normalizeSpaces(note.textContent);

        expect(note).toBeVisible();
        expect(noteText).toContain(normalizeSpaces(
            `розница от ${formatRubles(config.delivery_retail_min)} ₽ — доставка ${formatRubles(config.discounted_delivery_price)} ₽ до ${formatRubles(config.discounted_delivery_retail_weight_threshold)} кг, свыше — ${formatRubles(config.discounted_delivery_retail_heavy_price)} ₽.`
        ));
        expect(noteText).toContain(normalizeSpaces(
            `Опт от ${formatRubles(config.delivery_opt_min)} ₽ — доставка ${formatRubles(config.discounted_delivery_price)} ₽ при любом весе до ${formatRubles(vehiclesConfig[0].max_weight)} кг.`
        ));
        expect(noteText).toContain(normalizeSpaces(`Утром +${formatRubles(config.morning_add)} ₽`));
        expect(noteText).toContain(normalizeSpaces(`днём +${formatRubles(config.evening_add)} ₽`));
    });

    it('shows both GazON rates from the vehicle configuration', () => {
        render(
            <TariffReference
                vehiclesConfig={vehiclesConfig}
                isUnlocked={false}
                onUnlock={vi.fn()}
                onLock={vi.fn()}
            />
        );

        expect(screen.getByText(/Зелёная зона и Коминтерн · 80 ₽\/км/)).toBeVisible();
        expect(screen.getByText(/За городом · 55 ₽\/км/)).toBeVisible();
    });
});
