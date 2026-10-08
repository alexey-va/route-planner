import { describe, it, expect } from 'vitest';
import { calculate, config, vehiclesConfig } from './script.jsx';

describe('calculate function', () => {
  // Helper function to create default params
  const createDefaultParams = (overrides = {}) => ({
    distance: 10000, // 10 km
    weight: 500,
    vehicle: 0, // Газель 1.5т (основная для тестов)
    region: 'Киров',
    options: {
      by_time: false,
      morning: false,
      evening: false,
      today: false,
      retail: false,
      opt: false,
      day_of_week: 'weekdays'
    },
    regions: [],
    orderTotal: 0,
    ...overrides
  });

  describe('Edge Cases', () => {
    it('should return -1 when distance is 0', () => {
      const params = createDefaultParams({ distance: 0 });
      const result = calculate(params);
      
      expect(result.price).toBe(-1);
      expect(result.description).toContain('Не установлено расстояние');
    });

    it('should add comment when weight is 0', () => {
      const params = createDefaultParams({ weight: 0 });
      const result = calculate(params);
      
      expect(result.description).toContain('Нулевой вес');
    });

    it('should return -1 when day_of_week is "none"', () => {
      const params = createDefaultParams({ 
        options: { ...createDefaultParams().options, day_of_week: 'none' }
      });
      const result = calculate(params);
      
      expect(result.price).toBe(-1);
      expect(result.description).toContain('Не выбран день недели');
    });

    it('should return -2 when weight exceeds all vehicles', () => {
      const params = createDefaultParams({ weight: 15000 }); // Exceeds max weight (10000)
      const result = calculate(params);
      
      expect(result.price).toBe(-2);
      expect(result.description).toContain('Вес превышает грузоподъемность всех доступных машин');
    });
  });

  describe('Global Minimum Price', () => {
    it('should always have minimum price of 500 rubles', () => {
      const params = createDefaultParams({
        distance: 100, // Very short distance
        vehicle: 0, // Газель 1.5т
        region: 'Киров'
      });
      const result = calculate(params);
      
      expect(result.price).toBeGreaterThanOrEqual(500);
    });

    it('should apply global minimum even for short distances', () => {
      const params = createDefaultParams({
        distance: 500, // 0.5 km
        region: 'Другой город'
      });
      const result = calculate(params);
      
      // Минимум должен быть не менее 500 руб
      expect(result.price).toBeGreaterThanOrEqual(config.global_min_price);
    });
  });

  describe('Basic Price Calculation', () => {
    it('should calculate price based on distance for Gazel (vehicle 2 - 1.5т)', () => {
      const params = createDefaultParams({
        distance: 10000, // 10 km
        vehicle: 0, // Газель 1.5т
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      let expectedPrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (expectedPrice < vehiclesConfig[0].minimal_city_price) {
        expectedPrice = vehiclesConfig[0].minimal_city_price;
      }
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Базовая цена') && desc.includes(`${vehiclesConfig[0].price} руб/км`)
      )).toBe(true);
    });

    it('should calculate the Gazon price with its minimum', () => {
      const params = createDefaultParams({
        distance: 10000, // 10 km
        vehicle: 2, // Газон
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);

      expect(vehiclesConfig[2].price).toBe(80);
      expect(vehiclesConfig[2].minimal_city_price).toBe(2300);
      expect(result.price).toBe(2300);
      expect(result.description.some(desc => 
        desc.includes('Базовая цена') && desc.includes('50 руб/км')
      )).toBe(true);
    });

    it('should remove the 2t Gazel and recover a persisted selection of it', () => {
      expect(Object.keys(vehiclesConfig)).toEqual(['0', '2', '3']);

      const result = calculate(createDefaultParams({
        distance: 10000,
        weight: 1800,
        vehicle: 1,
        region: 'Другой город'
      }));

      expect(result.price).toBe(2300);
      expect(result.description.some(desc => desc.includes('50 руб/км'))).toBe(true);
    });

    it('should calculate price with base price for Kamaz', () => {
      const params = createDefaultParams({
        distance: 10000, // 10 km
        vehicle: 3 // Камаз
      });
      const result = calculate(params);
      
      const expectedPrice = 2000 + (10000 / 1000) * vehiclesConfig[3].price * 2;
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Базовая цена: 2000 руб')
      )).toBe(true);
    });

    it('should apply minimal city price for non-Kamaz vehicles', () => {
      const params = createDefaultParams({
        distance: 1000, // 1 km - very short distance
        vehicle: 0, // Газель 1.5т
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      expect(result.price).toBe(vehiclesConfig[0].minimal_city_price);
      expect(result.description.some(desc => 
        desc.includes('Минимальная стоимость доставки') && desc.includes(`${vehiclesConfig[0].minimal_city_price} руб`)
      )).toBe(true);
    });

    it('should not apply minimal price if calculated price is higher', () => {
      const params = createDefaultParams({
        distance: 50000, // 50 km - enough to exceed minimal
        vehicle: 0, // Газель 1.5т
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      const expectedPrice = (50000 / 1000) * vehiclesConfig[0].price * 2;
      expect(result.price).toBe(expectedPrice);
      expect(result.price).toBeGreaterThan(vehiclesConfig[0].minimal_city_price);
    });
  });

  describe('Gazon geographic rates', () => {
    it.each([
      ['green zone', 'Киров', [], 80, 6400],
      ['Komintern', 'Коминтерн', [], 80, 6400],
      ['overlapping zones', 'Киров', ['Коминтерн'], 80, 6400],
      ['Komintern flag', 'Область', ['Коминтерн'], 80, 6400],
      ['outside the zones', 'Область', [], 50, 4000],
      ['beyond the bridge', 'Область', ['За мостом'], 50, 4000]
    ])('uses the destination rate for %s', (_, region, regions, rate, expected) => {
      const result = calculate(createDefaultParams({
        distance: 40000, weight: 2000, vehicle: 2, region, regions
      }));
      expect(result.price).toBe(expected);
      expect(result.description[0]).toContain(`${rate} руб/км`);
    });

    it('keeps the 2300 minimum outside the city', () => {
      const result = calculate(createDefaultParams({
        distance: 5000, weight: 2000, vehicle: 2, region: 'Область'
      }));
      expect(result.price).toBe(2300);
    });

    it('applies time and weekend adjustments to the outside-city rate', () => {
      const result = calculate(createDefaultParams({
        distance: 40000, weight: 2000, vehicle: 2, region: 'Область',
        options: { ...createDefaultParams().options, by_time: true, day_of_week: 'weekend' }
      }));
      expect(result.price).toBe(4000 * 1.7 * 2);
    });
  });

  describe('Gazon route sections', () => {
    const routeZoneSplit = { insideMeters: 10000, outsideMeters: 30000, totalMeters: 40000 };
    const gazonParams = (overrides = {}) => createDefaultParams({
      vehicle: 2, weight: 1000, distance: 40000, region: 'Область', routeZoneSplit, ...overrides
    });

    it.each(['Киров', 'Коминтерн', 'Область'])('charges both sections regardless of destination %s', (region) => {
      const result = calculate(gazonParams({ region }));
      expect(result.price).toBe(4600); // (10 km × 80 + 30 km × 50) × 2
      expect(result.routePricing).toMatchObject({ mode: 'split', insideRate: 80, outsideRate: 50 });
      expect(result.description[0]).toContain('10.00 км × 80');
      expect(result.description[0]).toContain('30.00 км × 50');
    });

    it('applies the minimum to the combined cost only once', () => {
      const result = calculate(gazonParams({
        distance: 5000,
        routeZoneSplit: { insideMeters: 2000, outsideMeters: 3000, totalMeters: 5000 }
      }));
      expect(result.price).toBe(2300);
    });

    it('applies morning and weekend adjustments after adding the section costs', () => {
      const result = calculate(gazonParams({
        options: { ...createDefaultParams().options, morning: true, day_of_week: 'weekend' }
      }));
      expect(result.price).toBe(10200); // (4600 + 500) × 2
    });

    it('does not reuse route sections after the distance is edited manually', () => {
      const result = calculate(gazonParams({ distance: 50000 }));
      expect(result.price).toBe(5000);
      expect(result.routePricing).toEqual({ mode: 'destination', totalMeters: 50000, rate: 50 });
      expect(result.description).toContain('Без разбивки маршрута: тариф выбран по зоне назначения');
    });

    it.each([
      null,
      { insideMeters: -10000, outsideMeters: 50000, totalMeters: 40000 },
      { insideMeters: 30000, outsideMeters: 30000, totalMeters: 40000 },
      { insideMeters: NaN, outsideMeters: 30000, totalMeters: 40000 },
    ])('labels the destination fallback when section data is unavailable or invalid: %j', (split) => {
      const result = calculate(gazonParams({ routeZoneSplit: split }));
      expect(result.price).toBe(4000);
      expect(result.routePricing.mode).toBe('destination');
    });

    it.each([[0, 4400], [3, 7760]])('keeps the single rate of vehicle %s', (vehicle, expected) => {
      const result = calculate(gazonParams({ vehicle }));
      expect(result.price).toBe(expected);
      expect(result.routePricing.insideRate).toBe(result.routePricing.outsideRate);
    });
  });

  describe('Time Adjustments', () => {
    it('should multiply price by by_time factor', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          by_time: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.by_time;
      
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Доставка к конкретному времени') && desc.includes('× 1.7')
      )).toBe(true);
    });

    it('should add morning surcharge', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          morning: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice + config.morning_add;
      
      expect(result.price).toBe(expectedPrice);
      expect(result.description).toContain('Доставка утром. Надбавка: 500 руб');
    });

    it('should add evening surcharge', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          evening: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice + config.evening_add;
      
      expect(result.price).toBe(expectedPrice);
      expect(result.description).toContain('Доставка вечером. Надбавка: 300 руб');
    });

    it('should multiply price by today factor', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          today: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.today;
      
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Доставка сегодня') && desc.includes('× 2')
      )).toBe(true);
    });

    it('should prioritize by_time over morning/evening/today', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          by_time: true,
          morning: true,
          evening: true,
          today: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.by_time;
      
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Доставка к конкретному времени')
      )).toBe(true);
      expect(result.description).not.toContain('Доставка утром');
      expect(result.description).not.toContain('Доставка вечером');
      expect(result.description).not.toContain('Доставка сегодня');
    });
  });

  describe('Weekend Adjustments', () => {
    it.each([
      { vehicleName: 'Газон', vehicle: 2, day: 'weekend', weight: 1, expectedPrice: 8000 },
      { vehicleName: 'Газон', vehicle: 2, day: 'weekend', weight: 1000, expectedPrice: 8000 },
      { vehicleName: 'Газон', vehicle: 2, day: 'saturday', weight: 1, expectedPrice: 8000 },
      { vehicleName: 'Газон', vehicle: 2, day: 'saturday', weight: 1000, expectedPrice: 8000 },
      { vehicleName: 'Газон', vehicle: 2, day: 'sunday', weight: 1, expectedPrice: 8000 },
      { vehicleName: 'Газон', vehicle: 2, day: 'sunday', weight: 1000, expectedPrice: 8000 },
      { vehicleName: 'Камаз', vehicle: 3, day: 'weekend', weight: 1, expectedPrice: 15520 },
      { vehicleName: 'Камаз', vehicle: 3, day: 'weekend', weight: 1000, expectedPrice: 15520 },
      { vehicleName: 'Камаз', vehicle: 3, day: 'saturday', weight: 1, expectedPrice: 15520 },
      { vehicleName: 'Камаз', vehicle: 3, day: 'saturday', weight: 1000, expectedPrice: 15520 },
      { vehicleName: 'Камаз', vehicle: 3, day: 'sunday', weight: 1, expectedPrice: 15520 },
      { vehicleName: 'Камаз', vehicle: 3, day: 'sunday', weight: 1000, expectedPrice: 15520 }
    ])('$vehicleName gets one ×2 weekend multiplier at $weight kg for $day', ({ vehicle, day, weight, expectedPrice }) => {
      const result = calculate(createDefaultParams({
        distance: 40000,
        weight,
        vehicle,
        region: 'Область',
        options: { ...createDefaultParams().options, day_of_week: day }
      }));

      expect(result.price).toBe(expectedPrice);
      expect(result.description[0]).toContain(vehicle === 2 ? '50 руб/км' : '72 руб/км');
      expect(result.description.some((description) => description.includes('× 2 ='))).toBe(true);
      expect(result.description.some((description) => description.includes('× 1.5'))).toBe(false);
    });

    it.each([
      { vehicleName: 'Газон', vehicle: 2, weight: 1, expectedPrice: 4000 },
      { vehicleName: 'Газон', vehicle: 2, weight: 1000, expectedPrice: 4000 },
      { vehicleName: 'Камаз', vehicle: 3, weight: 1, expectedPrice: 7760 },
      { vehicleName: 'Камаз', vehicle: 3, weight: 1000, expectedPrice: 7760 }
    ])('$vehicleName keeps its weekday price at $weight kg', ({ vehicle, weight, expectedPrice }) => {
      const result = calculate(createDefaultParams({
        distance: 40000,
        weight,
        vehicle,
        region: 'Область',
        options: { ...createDefaultParams().options, day_of_week: 'weekdays' }
      }));

      expect(result.price).toBe(expectedPrice);
      expect(result.description.some((description) => description.includes('Доставка в выходные'))).toBe(false);
    });

    it.each([
      { vehicleName: 'Газон', vehicle: 2, basePrice: 4000, expectedPrice: 13600 },
      { vehicleName: 'Камаз', vehicle: 3, basePrice: 7760, expectedPrice: 26384 }
    ])('$vehicleName applies the weekend multiplier after the by-time multiplier', ({ vehicle, basePrice, expectedPrice }) => {
      const result = calculate(createDefaultParams({
        distance: 40000,
        weight: 500,
        vehicle,
        region: 'Область',
        options: { ...createDefaultParams().options, by_time: true, day_of_week: 'saturday' }
      }));
      const timeIndex = result.description.findIndex((description) => description.includes('Доставка к конкретному времени'));
      const weekendIndex = result.description.findIndex((description) => description.includes('Доставка в выходные'));

      expect(result.price).toBe(expectedPrice);
      expect(result.description[timeIndex]).toContain(`Цена: ${basePrice} руб × 1.7 = ${basePrice * 1.7} руб`);
      expect(result.description[weekendIndex]).toContain(`Цена: ${basePrice * 1.7} руб × 2 = ${expectedPrice} руб`);
      expect(timeIndex).toBeLessThan(weekendIndex);
    });

    it('should apply the Gazelle weekend multiplier for weights above 800kg', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 900, // > 800
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          day_of_week: 'weekend'
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.weekend_multiplier;
      
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Доставка в выходные дни для Газели с весом более 800 кг') && desc.includes('× 1.5')
      )).toBe(true);
    });

    it('should not apply weekend multiplier for items <= 800kg on weekend', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 800,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          day_of_week: 'weekend'
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      
      expect(result.price).toBe(basePrice);
      expect(result.description).not.toContain('Доставка в выходные дни для Газели с весом более 800 кг');
    });

    it('should not apply weekend multiplier on weekdays', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 900,
        region: 'Другой город', // Not Киров to avoid free delivery
        options: {
          ...createDefaultParams().options,
          day_of_week: 'weekdays'
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      // Apply minimal price if needed
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      
      expect(result.price).toBe(basePrice);
      expect(result.description).not.toContain('Доставка в выходные дни для Газели с весом более 800 кг');
    });
  });

  describe('Complex Scenarios', () => {
    it('should calculate correctly with multiple adjustments (Kamaz + by_time + weekend)', () => {
      const params = createDefaultParams({
        distance: 20000, // 20 km
        weight: 900,
        vehicle: 3, // Камаз
        options: {
          ...createDefaultParams().options,
          by_time: true,
          day_of_week: 'weekend'
        }
      });
      const result = calculate(params);
      
      // Kamaz: 2000 + (20 * 72 * 2) = 4880
      // by_time: 4880 * 1.7 = 8296
      // weekend: 8296 * 2 = 16592
      let expectedPrice = 2000 + (20000 / 1000) * vehiclesConfig[3].price * 2;
      expectedPrice *= config.by_time;
      expectedPrice *= 2;
      
      expect(result.price).toBe(expectedPrice);
    });

    it('should handle out-of-city delivery correctly', () => {
      const params = createDefaultParams({
        distance: 50000,
        weight: 1000,
        vehicle: 0, // Газель 1.5т
        region: 'Другой город'
      });
      const result = calculate(params);
      
      const expectedPrice = (50000 / 1000) * vehiclesConfig[0].price * 2;
      expect(result.price).toBe(expectedPrice);
    });

    it('should handle all vehicle types correctly', () => {
      const vehicles = [0, 2, 3];
      const distance = 10000;
      
      vehicles.forEach(vehicle => {
        const params = createDefaultParams({
          distance,
          vehicle,
          region: 'Другой город' // Not Киров to avoid free delivery
        });
        const result = calculate(params);
        
        if (vehicle === 3) {
          // Камаз has base price
          const expectedPrice = 2000 + (distance / 1000) * vehiclesConfig[vehicle].price * 2;
          expect(result.price).toBe(expectedPrice);
        } else {
          const expectedPrice = (distance / 1000) * vehiclesConfig[vehicle].price * 2;
          // May be adjusted to minimal price
          expect(result.price).toBeGreaterThanOrEqual(Math.min(expectedPrice, vehiclesConfig[vehicle].minimal_city_price));
        }
      });
    });

    it('should handle weight exactly at vehicle max capacity', () => {
      const params = createDefaultParams({
        weight: vehiclesConfig[0].max_weight, // Exactly 1500
        vehicle: 0, // Газель 1.5т
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      expect(result.price).toBeGreaterThanOrEqual(0);
      expect(result.price).not.toBe(-2);
    });

    it('should handle very long distances', () => {
      const params = createDefaultParams({
        distance: 500000, // 500 km
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      const expectedPrice = (500000 / 1000) * vehiclesConfig[0].price * 2;
      expect(result.price).toBe(expectedPrice);
    });

    it('should handle very short distances with minimal price', () => {
      const params = createDefaultParams({
        distance: 100, // 0.1 km
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      expect(result.price).toBe(vehiclesConfig[0].minimal_city_price);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle heavy weight (1500kg)', () => {
      const params = createDefaultParams({
        distance: 50000,
        weight: 1500,
        vehicle: 0, // Газель 1.5т
        region: 'Киров'
      });
      const result = calculate(params);
      
      // Теперь всегда платно, минимум 500 руб
      expect(result.price).toBeGreaterThanOrEqual(config.global_min_price);
    });

    it('should handle long distance delivery (100km)', () => {
      const params = createDefaultParams({
        distance: 100000, // 100km
        weight: 1000,
        vehicle: 0, // Газель 1.5т
        region: 'Киров'
      });
      const result = calculate(params);
      
      // Цена должна быть рассчитана
      expect(result.price).toBeGreaterThan(0);
    });

    it('should handle weight exactly at heavy weekend threshold (800kg)', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 800, // Exactly at threshold
        region: 'Другой город',
        options: {
          ...createDefaultParams().options,
          day_of_week: 'weekend'
        }
      });
      const result = calculate(params);
      
      // Should NOT apply weekend multiplier (weight must be > 800)
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      expect(result.price).toBe(basePrice);
      expect(result.description).not.toContain('Доставка в выходные дни для Газели с весом более 800 кг');
    });

    it('should handle weight just over heavy weekend threshold (801kg)', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 801, // Just over threshold
        region: 'Другой город',
        options: {
          ...createDefaultParams().options,
          day_of_week: 'weekend'
        }
      });
      const result = calculate(params);
      
      // Should apply weekend multiplier
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.weekend_multiplier;
      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(desc => 
        desc.includes('Доставка в выходные дни для Газели с весом более 800 кг')
      )).toBe(true);
    });

    it('should handle each vehicle at its exact max weight', () => {
      const testCases = [
        { vehicle: 0, maxWeight: vehiclesConfig[0].max_weight },
        { vehicle: 2, maxWeight: vehiclesConfig[2].max_weight },
        { vehicle: 3, maxWeight: vehiclesConfig[3].max_weight }
      ];
      
      testCases.forEach(({ vehicle, maxWeight }) => {
        const params = createDefaultParams({
          weight: maxWeight,
          vehicle,
          region: 'Другой город'
        });
        const result = calculate(params);
        
        expect(result.price).not.toBe(-2);
        expect(result.price).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle distance exactly at minimal price threshold', () => {
      // For vehicle 0 (1.5т): minimal is 1300, so need distance where price = 1300
      // 1300 = (distance/1000) * 55 * 2 => distance ≈ 11818
      const params = createDefaultParams({
        distance: 11818,
        vehicle: 0, // Газель 1.5т
        region: 'Другой город'
      });
      const result = calculate(params);
      
      const calculatedPrice = (11818 / 1000) * vehiclesConfig[0].price * 2;
      // Should be close to minimal (might be slightly off due to rounding)
      expect(result.price).toBeGreaterThanOrEqual(vehiclesConfig[0].minimal_city_price - 1);
      expect(result.price).toBeLessThanOrEqual(vehiclesConfig[0].minimal_city_price + 1);
    });

    it('should handle distance just below minimal price threshold', () => {
      const params = createDefaultParams({
        distance: 11000, // Just below minimal threshold
        vehicle: 0, // Газель 1.5т
        region: 'Другой город'
      });
      const result = calculate(params);
      
      // Calculated: 11000/1000 * 55 * 2 = 1210, which is < 1300, so minimal applies
      expect(result.price).toBe(vehiclesConfig[0].minimal_city_price);
      // Check if any description contains minimal price info
      const hasMinimalComment = result.description.some(desc => 
        typeof desc === 'string' && desc.includes('Минимальная стоимость доставки')
      );
      expect(hasMinimalComment).toBe(true);
    });
  });

  describe('Missing/Undefined Parameters', () => {
    it('should handle undefined regions array', () => {
      const params = createDefaultParams({
        regions: undefined,
        region: 'Другой город'
      });
      const result = calculate(params);
      
      expect(result.price).toBeGreaterThanOrEqual(0);
      expect(result.description).toBeDefined();
    });

    it('should handle null regions array', () => {
      const params = createDefaultParams({
        regions: null,
        region: 'Другой город'
      });
      // This might throw, but let's test it
      expect(() => calculate(params)).not.toThrow();
    });

    it('should handle empty regions array', () => {
      const params = createDefaultParams({
        regions: [],
        region: 'Другой город'
      });
      const result = calculate(params);
      
      expect(result.price).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle negative distance', () => {
      const params = createDefaultParams({
        distance: -1000,
        region: 'Другой город'
      });
      
      // Negative distance should be treated as 0 or cause issues
      const result = calculate(params);
      // The function checks for distance === 0, but negative might pass through
      // Let's see what happens
      expect(result).toHaveProperty('price');
    });

    it('should handle negative weight', () => {
      const params = createDefaultParams({
        weight: -100,
        region: 'Другой город'
      });
      
      const result = calculate(params);
      // Weight check is for > max_weight, so negative should pass
      expect(result).toHaveProperty('price');
    });

    it('should handle very large distance values', () => {
      const params = createDefaultParams({
        distance: 10000000, // 10000 km
        region: 'Другой город'
      });
      const result = calculate(params);
      
      const expectedPrice = (10000000 / 1000) * vehiclesConfig[0].price * 2;
      expect(result.price).toBe(expectedPrice);
    });

    it('should handle decimal weight values', () => {
      const params = createDefaultParams({
        weight: 1234.56,
        region: 'Другой город'
      });
      const result = calculate(params);
      
      expect(result.price).toBeGreaterThanOrEqual(0);
      expect(result.price).not.toBe(-2);
    });

    it('should handle decimal distance values', () => {
      const params = createDefaultParams({
        distance: 12345.67,
        region: 'Другой город'
      });
      const result = calculate(params);
      
      expect(result.price).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Time Adjustment Combinations', () => {
    it('should apply by_time even if morning is also true (by_time takes priority)', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город',
        options: {
          ...createDefaultParams().options,
          by_time: true,
          morning: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.by_time;
      
      expect(result.price).toBe(expectedPrice);
      // Check if any description contains the by_time message
      const hasByTimeComment = result.description.some(desc => 
        typeof desc === 'string' && desc.includes('Доставка к конкретному времени')
      );
      expect(hasByTimeComment).toBe(true);
      // Should not have morning comment
      const hasMorningComment = result.description.some(desc => 
        typeof desc === 'string' && desc.includes('Доставка утром')
      );
      expect(hasMorningComment).toBe(false);
    });

    it('should apply weekend multiplier after by_time adjustment', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 900,
        region: 'Другой город',
        options: {
          ...createDefaultParams().options,
          by_time: true,
          day_of_week: 'weekend'
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      let price = basePrice * config.by_time;
      price *= config.weekend_multiplier;
      
      expect(result.price).toBe(price);
    });
  });

  describe('Comment Accuracy', () => {
    it('should include correct price in by_time comment', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город',
        options: {
          ...createDefaultParams().options,
          by_time: true
        }
      });
      const result = calculate(params);
      
      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      
      const comment = result.description.find(desc => 
        desc.includes('Доставка к конкретному времени')
      );
      expect(comment).toBeDefined();
      expect(comment).toContain(basePrice.toFixed(0));
      expect(comment).toContain((basePrice * config.by_time).toFixed(0));
    });

    it('should include correct distance in base price comment', () => {
      const params = createDefaultParams({
        distance: 12345,
        region: 'Другой город'
      });
      const result = calculate(params);
      
      const comment = result.description.find(desc => 
        desc.includes('Базовая цена')
      );
      expect(comment).toBeDefined();
      expect(comment).toContain('12.3'); // (12345 / 1000).toFixed(1)
    });
  });

  describe('Return Value Structure', () => {
    it('should always return an object with price and description', () => {
      const params = createDefaultParams({
        region: 'Другой город' // Not Киров to avoid free delivery
      });
      const result = calculate(params);
      
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('description');
      expect(Array.isArray(result.description)).toBe(true);
    });

    it('should always have description as an array', () => {
      const testCases = [
        createDefaultParams(),
        createDefaultParams({ distance: 0 }),
        createDefaultParams({ weight: 0 }),
        createDefaultParams({ 
          options: { ...createDefaultParams().options, day_of_week: 'none' }
        })
      ];
      
      testCases.forEach(params => {
        const result = calculate(params);
        expect(Array.isArray(result.description)).toBe(true);
      });
    });

    it('should return price as a number', () => {
      const params = createDefaultParams({
        region: 'Другой город'
      });
      const result = calculate(params);
      
      expect(typeof result.price).toBe('number');
      expect(Number.isFinite(result.price)).toBe(true);
    });

    it('should return description with at least one element when there are comments', () => {
      const params = createDefaultParams({
        distance: 10000,
        region: 'Другой город'
      });
      const result = calculate(params);
      
      expect(result.description.length).toBeGreaterThan(0);
    });
  });

  describe('Discounted Delivery with Retail/Opt', () => {
    it.each([
      ['opt', 19999, 1300],
      ['opt', 20000, 700],
      ['opt', 25000, 700],
      ['retail', 20000, 1300],
      ['retail', 24999, 1300],
      ['retail', 25000, 700]
    ])('charges %s orders of %i at %i rubles', (orderType, orderTotal, price) => {
      const result = calculate(createDefaultParams({
        orderTotal,
        options: { ...createDefaultParams().options, [orderType]: true }
      }));
      expect(result.price).toBe(price);
      expect(result.description.join(' ')).not.toContain('Бесплатная доставка');
    });

    it('should apply discounted delivery for retail with order >= 25000, weight <= 1500, vehicle <= 1.5t, in city', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBe(700);
      expect(result.description).toEqual(['Льготная доставка: 700 руб, розница, заказ от 25000 руб']);
    });

    it('should NOT apply discounted delivery for opt with order >= 25000, in Komintern', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1500,
        vehicle: 0,
        region: 'Другой город',
        regions: ['Коминтерн'],
        orderTotal: 25000,
        options: { ...createDefaultParams().options, opt: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery for retail when order < 25000', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1000,
        region: 'Киров',
        orderTotal: 24999,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery for opt when order < 20000', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1000,
        region: 'Киров',
        orderTotal: 19999,
        options: { ...createDefaultParams().options, opt: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery when weight > 1500 kg even with sufficient order', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1501,
        vehicle: 2,
        region: 'Киров',
        orderTotal: 30000,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery when vehicle > 1.5t even with suitable weight', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1000,
        vehicle: 2,
        region: 'Киров',
        orderTotal: 30000,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery without retail/opt selected', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 1000,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 60000
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery when outside city and not Komintern', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Другой город',
        regions: [],
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should apply discounted delivery for retail at exactly 25000 in city', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBe(700);
    });

    it('should NOT apply discounted delivery for opt at exactly 25000 in Komintern', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Другой город',
        regions: ['Коминтерн'],
        orderTotal: 25000,
        options: { ...createDefaultParams().options, opt: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery in Kirov when Comintern region is included', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        regions: ['Коминтерн'],
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery on weekend even with sufficient order', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 30000,
        options: { ...createDefaultParams().options, retail: true, day_of_week: 'weekend' }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should apply weekend multiplier instead of discounted delivery for heavy retail on Saturday', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 900,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 30000,
        options: { ...createDefaultParams().options, retail: true, day_of_week: 'weekend' }
      });
      const result = calculate(params);

      let basePrice = (10000 / 1000) * vehiclesConfig[0].price * 2;
      if (basePrice < vehiclesConfig[0].minimal_city_price) {
        basePrice = vehiclesConfig[0].minimal_city_price;
      }
      const expectedPrice = basePrice * config.weekend_multiplier;

      expect(result.price).toBe(expectedPrice);
      expect(result.description.some(d => d && d.includes('Доставка в выходные дни для Газели с весом более 800 кг'))).toBe(true);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should NOT apply discounted delivery when by_time option is selected', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true, by_time: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });

    it('should apply discounted delivery with morning surcharge when morning option is selected', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true, morning: true }
      });
      const result = calculate(params);
      expect(result.price).toBe(700 + config.morning_add);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(true);
      expect(result.description.some(d => d && d.includes('Надбавка: 500 руб'))).toBe(true);
    });

    it('should apply discounted delivery with evening surcharge when evening option is selected', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true, evening: true }
      });
      const result = calculate(params);
      expect(result.price).toBe(700 + config.evening_add);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(true);
      expect(result.description.some(d => d && d.includes('Надбавка: 300 руб'))).toBe(true);
    });

    it('should NOT apply discounted delivery when today option is selected', () => {
      const params = createDefaultParams({
        distance: 10000,
        weight: 500,
        vehicle: 0,
        region: 'Киров',
        orderTotal: 25000,
        options: { ...createDefaultParams().options, retail: true, today: true }
      });
      const result = calculate(params);
      expect(result.price).toBeGreaterThan(0);
      expect(result.description.some(d => d && d.includes('Льготная доставка'))).toBe(false);
    });
  });
});
