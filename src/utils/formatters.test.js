import { describe, it, expect } from 'vitest';
import { formatDistance, formatWeight, formatPrice } from './formatters';

describe('formatters', () => {
  describe('formatDistance', () => {
    it('should format distance in kilometers with 1 decimal place', () => {
      expect(formatDistance(10000)).toBe('10');
      expect(formatDistance(12345)).toBe('12.3');
      expect(formatDistance(5000)).toBe('5');
      expect(formatDistance(1234)).toBe('1.2');
    });

    it('should handle zero distance', () => {
      expect(formatDistance(0)).toBe('0');
    });

    it('should handle very large distances', () => {
      expect(formatDistance(100000)).toBe('100');
      expect(formatDistance(123456)).toBe('123.4');
    });
  });

  describe('formatWeight', () => {
    it('should format weight as integer', () => {
      expect(formatWeight(100)).toBe('100');
      expect(formatWeight(1234.56)).toBe('1234');
      expect(formatWeight(500)).toBe('500');
    });

    it('should handle zero weight', () => {
      expect(formatWeight(0)).toBe('0');
    });

    it('should handle decimal weights', () => {
      expect(formatWeight(123.45)).toBe('123');
      expect(formatWeight(999.99)).toBe('999');
    });
  });

  describe('formatPrice', () => {
    it('should return "Бесплатно" for zero price', () => {
      expect(formatPrice(0)).toBe('Бесплатно');
    });

    it('should return "Нет" for -1 or invalid prices', () => {
      expect(formatPrice(-1)).toBe('Нет');
      expect(formatPrice(undefined)).toBe('Нет');
      expect(formatPrice(NaN)).toBe('Нет');
    });

    it('should return "Рассчитайте вручную" for -2', () => {
      expect(formatPrice(-2)).toBe('Рассчитайте вручную');
    });

    it('should format positive prices with руб suffix', () => {
      expect(formatPrice(100)).toBe('100 руб');
      expect(formatPrice(1234.56)).toBe('1235 руб');
      expect(formatPrice(5000)).toBe('5000 руб');
    });

    it('should round prices to nearest integer', () => {
      expect(formatPrice(123.4)).toBe('123 руб');
      expect(formatPrice(123.6)).toBe('124 руб');
    });
  });
});

