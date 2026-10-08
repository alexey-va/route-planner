import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WeightDistanceInput from './WeightDistanceInput';

describe('weekend rate hint', () => {
    it.each([2, 3])('shows the truck surcharge even at 1 kg for vehicle %s', (vehicle) => {
        render(
            <WeightDistanceInput
                vehicle={vehicle}
                weight={1}
                distance={10000}
                options={{ day_of_week: 'weekend' }}
                handleWeightChange={vi.fn()}
                setDistance={vi.fn()}
            />
        );

        expect(screen.getByText('В выходные стоимость ×2 при любом весе')).toBeVisible();
        expect(screen.queryByText(/\+50%/)).not.toBeInTheDocument();
    });

    it('keeps the existing weight-based surcharge hint for Gazelle', () => {
        render(
            <WeightDistanceInput
                vehicle={0}
                weight={801}
                distance={10000}
                options={{ day_of_week: 'weekend' }}
                handleWeightChange={vi.fn()}
                setDistance={vi.fn()}
            />
        );

        expect(screen.getByText('Свыше 800 кг в выходные: +50%')).toBeVisible();
        expect(screen.queryByText(/при любом весе/)).not.toBeInTheDocument();
    });
});
