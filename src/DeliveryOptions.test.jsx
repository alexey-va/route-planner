import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeliveryOptions from './DeliveryOptions';
import { config, vehiclesConfig } from './script.jsx';

const formatRubles = (amount) => amount.toLocaleString('ru-RU');
const normalizeSpaces = (text) => text.replace(/\s+/g, ' ').trim();

const options = {
    by_time: false,
    morning: false,
    evening: false,
    retail: true,
    opt: false,
    day_of_week: 'none'
};

describe('DeliveryOptions', () => {
    it('shows order thresholds, retail weight tiers and time surcharges without unlocking hints', () => {
        const { container } = render(
            <DeliveryOptions
                options={options}
                handleOptionChange={vi.fn()}
                setOrderTotal={vi.fn()}
            />
        );

        const explanation = container.querySelector('#route-order-discount');
        const explanationText = normalizeSpaces(explanation.textContent);

        expect(explanation).toBeVisible();
        expect(explanationText).toContain('Льготная доставка Газелью');
        expect(explanationText).toContain(normalizeSpaces(
            `Розница от ${formatRubles(config.delivery_retail_min)} ₽ — доставка ${formatRubles(config.discounted_delivery_price)} ₽ до ${formatRubles(config.discounted_delivery_retail_weight_threshold)} кг, свыше — ${formatRubles(config.discounted_delivery_retail_heavy_price)} ₽.`
        ));
        expect(explanationText).toContain(normalizeSpaces(
            `Опт от ${formatRubles(config.delivery_opt_min)} ₽ — доставка ${formatRubles(config.discounted_delivery_price)} ₽ при любом весе до ${formatRubles(vehiclesConfig[0].max_weight)} кг.`
        ));
        expect(screen.getByText(`9:00–12:00 · +${formatRubles(config.morning_add)} ₽`)).toBeVisible();
        expect(screen.getByText(`12:00–16:00 · +${formatRubles(config.evening_add)} ₽`)).toBeVisible();
        expect(screen.getByRole('radio', { name: 'Розница', exact: true })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Опт', exact: true })).not.toBeChecked();
        expect(screen.getByRole('spinbutton', { name: 'Сумма заказа' })).toHaveAttribute(
            'aria-describedby', 'route-order-discount'
        );
    });

    it('keeps the day validation message slot mounted after a day is selected', () => {
        const { container, rerender } = render(
            <DeliveryOptions
                options={options}
                handleOptionChange={vi.fn()}
                validationErrors={{ day_of_week: 'Выберите день недели' }}
                setOrderTotal={vi.fn()}
            />
        );

        expect(screen.getByText('Выберите день недели')).toHaveClass(
            'route-day-message',
            'is-error'
        );
        expect(container.querySelector('.route-day-options')).toHaveClass('has-error');

        rerender(
            <DeliveryOptions
                options={{ ...options, day_of_week: 'weekdays' }}
                handleOptionChange={vi.fn()}
                validationErrors={{}}
                setOrderTotal={vi.fn()}
            />
        );

        const messageSlot = container.querySelector('.route-day-message');
        expect(messageSlot).toBeInTheDocument();
        expect(messageSlot).toHaveClass('is-placeholder');
        expect(messageSlot).toHaveTextContent('');
        expect(container.querySelector('.route-day-options')).not.toHaveClass('has-error');
        expect(
            container.querySelector('.route-option-group:last-child > .route-field-message')
        ).toHaveClass('is-placeholder');
    });
});
