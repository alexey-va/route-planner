import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouteZoneBreakdown from './RouteZoneBreakdown';
import ResultDisplay from '../ResultDisplay';

const splitPricing = {
    mode: 'split',
    insideMeters: 1250,
    outsideMeters: 20250,
    totalMeters: 21500,
    insideRate: 80,
    outsideRate: 50
};

describe('RouteZoneBreakdown', () => {
    it.each([null, undefined])('renders nothing when route pricing is %s', (pricing) => {
        const { container } = render(<RouteZoneBreakdown pricing={pricing} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('shows one-way zone distances, distinct rates, and the round-trip pricing note', () => {
        render(<RouteZoneBreakdown pricing={splitPricing} />);

        expect(screen.getByText('Маршрут по зонам')).toBeInTheDocument();
        expect(screen.getByText('В одну сторону · 21,50 км')).toBeInTheDocument();
        expect(screen.getByText('Киров и Коминтерн')).toBeInTheDocument();
        expect(screen.getByText('1,25 км')).toBeInTheDocument();
        expect(screen.getByText('80 ₽/км')).toBeInTheDocument();
        expect(screen.getByText('За городом')).toBeInTheDocument();
        expect(screen.getByText('20,25 км')).toBeInTheDocument();
        expect(screen.getByText('50 ₽/км')).toBeInTheDocument();
        expect(screen.getByText('Для расчёта стоимости пробег считается туда-обратно.')).toBeInTheDocument();
    });

    it('does not show two separate tariffs when both zones use 55 rubles per kilometre', () => {
        render(
            <RouteZoneBreakdown
                pricing={{ ...splitPricing, insideRate: 55, outsideRate: 55 }}
            />
        );

        expect(screen.getByText('Киров и Коминтерн')).toBeInTheDocument();
        expect(screen.getByText('За городом')).toBeInTheDocument();
        expect(screen.queryByText('55 ₽/км')).not.toBeInTheDocument();
    });

    it('explains that destination-only pricing is not a zone breakdown', () => {
        render(<RouteZoneBreakdown pricing={{ mode: 'destination', totalMeters: 12000, rate: 55 }} />);

        expect(
            screen.getByText('Без разбивки: весь путь по 55 ₽/км. Постройте маршрут на карте для расчёта по зонам.')
        ).toBeInTheDocument();
        expect(screen.queryByText('Маршрут по зонам')).not.toBeInTheDocument();
    });

    it('appears after route details and before private comments and the price', () => {
        const { container } = render(
            <ResultDisplay
                distance={21500}
                region="Киров"
                address="Тестовый адрес"
                price={{ price: 1000, description: ['Служебный комментарий'], routePricing: splitPricing }}
                weight={500}
                mapDistance={21500}
                reset={() => {}}
                showComments
            />
        );

        const details = container.querySelector('.route-result-details');
        const breakdown = container.querySelector('[aria-label="Разбивка пробега по зонам"]');
        const comments = container.querySelector('.route-result-comments');
        const price = container.querySelector('.route-price-card');

        expect(details.compareDocumentPosition(breakdown) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(breakdown.compareDocumentPosition(comments) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(comments.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
});
