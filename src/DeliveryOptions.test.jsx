import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeliveryOptions from './DeliveryOptions';
import { config } from './script.jsx';

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
    it('shows wholesale and retail order thresholds without unlocking hints', () => {
        const { container } = render(
            <DeliveryOptions
                options={options}
                handleOptionChange={vi.fn()}
                setOrderTotal={vi.fn()}
            />
        );

        const thresholds = Array.from(container.querySelectorAll('.route-order-threshold'));
        const thresholdText = thresholds.map((threshold) => normalizeSpaces(threshold.textContent));

        expect(thresholds).toHaveLength(2);
        expect(thresholdText).toContain(normalizeSpaces(`от ${formatRubles(config.delivery_opt_min)} ₽`));
        expect(thresholdText).toContain(normalizeSpaces(`от ${formatRubles(config.delivery_retail_min)} ₽`));
        thresholds.forEach((threshold) => expect(threshold).toBeVisible());
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
