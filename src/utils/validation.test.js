import { describe, it, expect } from 'vitest';
import { validateFields, getFieldValidationClass } from './validation';

describe('validateFields', () => {
    it('should return valid for all required fields filled', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday' }, 'Киров');
        
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return error for missing distance', () => {
        const result = validateFields(0, 500, { day_of_week: 'monday' }, 'Киров', 0);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.distance).toBe('Укажите расстояние или выберите точку на карте');
    });

    it('should return error for negative distance', () => {
        const result = validateFields(-100, 500, { day_of_week: 'monday' }, 'Киров', 0);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.distance).toBe('Укажите расстояние или выберите точку на карте');
    });

    it('should accept distance from map even if manual distance is 0', () => {
        const result = validateFields(0, 500, { day_of_week: 'monday' }, 'Киров', 5000);
        
        expect(result.isValid).toBe(true);
        expect(result.errors.distance).toBeUndefined();
    });

    it('should accept manual distance even if map distance is 0', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday' }, 'Киров', 0);
        
        expect(result.isValid).toBe(true);
        expect(result.errors.distance).toBeUndefined();
    });

    it('should return error for missing weight', () => {
        const result = validateFields(5000, 0, { day_of_week: 'monday' }, 'Киров');
        
        expect(result.isValid).toBe(false);
        expect(result.errors.weight).toBe('Укажите вес груза');
    });

    it('should return error for missing day_of_week', () => {
        const result = validateFields(5000, 500, { day_of_week: 'none' }, 'Киров');
        
        expect(result.isValid).toBe(false);
        expect(result.errors.day_of_week).toBe('Выберите день недели');
    });

    it('should return warning for weight less than 1', () => {
        const result = validateFields(5000, 0.5, { day_of_week: 'monday' }, 'Киров');
        
        expect(result.isValid).toBe(true);
        expect(result.warnings.weight).toBe('Минимальный вес 1 кг');
    });

    it('should return warning for distance less than 1km (manual)', () => {
        const result = validateFields(500, 500, { day_of_week: 'monday' }, 'Киров', 0);
        
        expect(result.isValid).toBe(true);
        expect(result.warnings.distance).toBe('Расстояние менее 1 км');
    });

    it('should return warning for distance less than 1km (from map)', () => {
        const result = validateFields(0, 500, { day_of_week: 'monday' }, 'Киров', 500);
        
        expect(result.isValid).toBe(true);
        expect(result.warnings.distance).toBe('Расстояние менее 1 км');
    });

    it('should return warning for missing region', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday' }, '');
        
        expect(result.isValid).toBe(true);
        expect(result.warnings.region).toBe('Район не указан');
    });

    it('should return error for missing orderTotal when pay_cash is selected', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday', pay_cash: true }, 'Киров', 0, 0);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.orderTotal).toBe('Укажите сумму заказа');
    });

    it('should return error for missing orderTotal when pay_sbp is selected', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday', pay_sbp: true }, 'Киров', 0, 0);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.orderTotal).toBe('Укажите сумму заказа');
    });

    it('should be valid when orderTotal is provided with pay_cash', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday', pay_cash: true }, 'Киров', 0, 45000);
        
        expect(result.isValid).toBe(true);
        expect(result.errors.orderTotal).toBeUndefined();
    });

    it('should be valid when orderTotal is provided with pay_sbp', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday', pay_sbp: true }, 'Киров', 0, 55000);
        
        expect(result.isValid).toBe(true);
        expect(result.errors.orderTotal).toBeUndefined();
    });

    it('should not require orderTotal when no payment option is selected', () => {
        const result = validateFields(5000, 500, { day_of_week: 'monday', pay_cash: false, pay_sbp: false }, 'Киров', 0, 0);
        
        expect(result.isValid).toBe(true);
        expect(result.errors.orderTotal).toBeUndefined();
    });

    it('should return multiple errors', () => {
        const result = validateFields(0, 0, { day_of_week: 'none' }, '');
        
        expect(result.isValid).toBe(false);
        expect(result.errors.distance).toBeDefined();
        expect(result.errors.weight).toBeDefined();
        expect(result.errors.day_of_week).toBeDefined();
    });

    it('should return both errors and warnings', () => {
        const result = validateFields(0, 0.5, { day_of_week: 'none' }, '');
        
        expect(result.isValid).toBe(false);
        expect(result.errors.distance).toBeDefined();
        expect(result.errors.day_of_week).toBeDefined();
        expect(result.warnings.weight).toBeDefined();
        expect(result.warnings.region).toBeDefined();
    });
});

describe('getFieldValidationClass', () => {
    it('should return error class when hasError is true', () => {
        const className = getFieldValidationClass(true, false);
        expect(className).toContain('border-red-500');
        expect(className).toContain('focus:ring-red-500');
    });

    it('should return warning class when hasWarning is true and no error', () => {
        const className = getFieldValidationClass(false, true);
        expect(className).toContain('border-yellow-400');
        expect(className).toContain('focus:ring-yellow-400');
    });

    it('should return default class when no error or warning', () => {
        const className = getFieldValidationClass(false, false);
        expect(className).toBe('border-gray-300');
    });

    it('should prioritize error over warning', () => {
        const className = getFieldValidationClass(true, true);
        expect(className).toContain('border-red-500');
        expect(className).not.toContain('border-yellow-400');
    });
});

