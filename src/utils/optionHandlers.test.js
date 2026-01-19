import { describe, it, expect, vi } from 'vitest';
import { handleOptionChange, findNextAvailableVehicle } from './optionHandlers';

describe('optionHandlers', () => {
  describe('handleOptionChange', () => {
    it('should toggle opt option and reset price when enabling opt', () => {
      const setOptions = vi.fn();
      const currentOptions = { opt: false, price: true };

      handleOptionChange('opt', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalledWith(expect.any(Function));
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.opt).toBe(true);
      expect(result.price).toBe(false);
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

    it('should handle payment options - mutually exclusive (pay_cash)', () => {
      const setOptions = vi.fn();
      const currentOptions = { pay_cash: false, pay_sbp: true };

      handleOptionChange('pay_cash', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.pay_cash).toBe(true);
      expect(result.pay_sbp).toBe(false);
    });

    it('should handle payment options - mutually exclusive (pay_sbp)', () => {
      const setOptions = vi.fn();
      const currentOptions = { pay_cash: true, pay_sbp: false };

      handleOptionChange('pay_sbp', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.pay_cash).toBe(false);
      expect(result.pay_sbp).toBe(true);
    });

    it('should allow unchecking payment option', () => {
      const setOptions = vi.fn();
      const currentOptions = { pay_cash: true, pay_sbp: false };

      handleOptionChange('pay_cash', currentOptions, setOptions);

      expect(setOptions).toHaveBeenCalled();
      const updateFn = setOptions.mock.calls[0][0];
      const result = updateFn(currentOptions);
      expect(result.pay_cash).toBe(false);
      expect(result.pay_sbp).toBe(false);
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

