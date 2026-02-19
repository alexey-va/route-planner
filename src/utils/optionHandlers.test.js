import { describe, it, expect, vi } from 'vitest';
import { handleOptionChange, findNextAvailableVehicle } from './optionHandlers';

describe('optionHandlers', () => {
  describe('handleOptionChange', () => {
    it('should handle retail/opt options - mutually exclusive (retail)', () => {
      const setOptions = vi.fn();
      const currentOptions = { retail: false, opt: true };

      handleOptionChange('retail', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.retail).toBe(true);
      expect(result.opt).toBe(false);
    });

    it('should handle retail/opt options - mutually exclusive (opt)', () => {
      const setOptions = vi.fn();
      const currentOptions = { retail: true, opt: false };

      handleOptionChange('opt', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.retail).toBe(false);
      expect(result.opt).toBe(true);
    });

    it('should allow unchecking retail option', () => {
      const setOptions = vi.fn();
      const currentOptions = { retail: true, opt: false };

      handleOptionChange('retail', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.retail).toBe(false);
      expect(result.opt).toBe(false);
    });

    it('should handle time options - only one can be selected', () => {
      const setOptions = vi.fn();
      const currentOptions = { by_time: false, morning: true, evening: false, today: false };

      handleOptionChange('evening', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.morning).toBe(false);
      expect(result.evening).toBe(true);
      expect(result.by_time).toBe(false);
      expect(result.today).toBe(false);
    });

    it('should set day_of_week for day options', () => {
      const setOptions = vi.fn();
      const currentOptions = { day_of_week: 'monday' };

      handleOptionChange('friday', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.day_of_week).toBe('friday');
    });

    it('should toggle other options', () => {
      const setOptions = vi.fn();
      const currentOptions = { someOption: false, price: true };

      handleOptionChange('someOption', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.someOption).toBe(true);
      expect(result.price).toBe(true); // Should remain unchanged
    });

  });

  describe('findNextAvailableVehicle', () => {
    const vehiclesConfig = {
      0: { max_weight: 1500 },
      1: { max_weight: 2000 },
      2: { max_weight: 4300 },
      3: { max_weight: 10000 }
    };

    it('should find correct vehicle for weight', () => {
      expect(findNextAvailableVehicle(500, vehiclesConfig)).toBe(0);
      expect(findNextAvailableVehicle(1500, vehiclesConfig)).toBe(0);
      expect(findNextAvailableVehicle(1501, vehiclesConfig)).toBe(1);
      expect(findNextAvailableVehicle(2000, vehiclesConfig)).toBe(1);
      expect(findNextAvailableVehicle(4300, vehiclesConfig)).toBe(2);
      expect(findNextAvailableVehicle(10000, vehiclesConfig)).toBe(3);
    });

    it('should return 0 if weight exceeds all vehicles', () => {
      expect(findNextAvailableVehicle(15000, vehiclesConfig)).toBe(0);
    });
  });
});

