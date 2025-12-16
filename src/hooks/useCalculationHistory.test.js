import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculationHistory } from './useCalculationHistory';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('useCalculationHistory', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should initialize with empty history', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        expect(result.current.history).toEqual([]);
    });

    it('should load history from localStorage', () => {
        const storedHistory = [
            { id: 1, timestamp: '2024-01-01T00:00:00.000Z', distance: 10000, weight: 500 }
        ];
        localStorageMock.setItem('calculation_history', JSON.stringify(storedHistory));
        
        const { result } = renderHook(() => useCalculationHistory());
        
        expect(result.current.history).toEqual(storedHistory);
    });

    it('should add calculation to history', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        act(() => {
            result.current.addToHistory({
                distance: 10000,
                weight: 500,
                price: { price: 1000, description: [] }
            });
        });
        
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0]).toMatchObject({
            distance: 10000,
            weight: 500
        });
        expect(result.current.history[0].id).toBeDefined();
        expect(result.current.history[0].timestamp).toBeDefined();
    });

    it('should limit history to MAX_HISTORY_ITEMS (20)', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        act(() => {
            for (let i = 0; i < 25; i++) {
                result.current.addToHistory({
                    distance: i * 1000,
                    weight: 500
                });
            }
        });
        
        expect(result.current.history).toHaveLength(20);
    });

    it('should remove calculation from history', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        // Add first item
        act(() => {
            result.current.addToHistory({ distance: 10000, weight: 500, id: 'test-1' });
        });
        
        expect(result.current.history).toHaveLength(1);
        const firstId = result.current.history[0].id;
        
        // Add second item
        act(() => {
            result.current.addToHistory({ distance: 20000, weight: 600, id: 'test-2' });
        });
        
        expect(result.current.history).toHaveLength(2);
        
        // Remove first item
        act(() => {
            result.current.removeFromHistory(firstId);
        });
        
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].distance).toBe(20000);
    });

    it('should clear all history', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        act(() => {
            result.current.addToHistory({ distance: 10000, weight: 500 });
            result.current.addToHistory({ distance: 20000, weight: 600 });
        });
        
        expect(result.current.history).toHaveLength(2);
        
        act(() => {
            result.current.clearHistory();
        });
        
        expect(result.current.history).toEqual([]);
    });

    it('should load calculation data correctly', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        const historyItem = {
            id: 1,
            timestamp: '2024-01-01T00:00:00.000Z',
            distance: 10000,
            region: 'Киров',
            regions: ['Коминтерн'],
            address: 'Тестовый адрес',
            duration: 30,
            weight: 500,
            options: { by_time: true, day_of_week: 'monday' },
            vehicle: 0,
            mapDistance: 10000,
            advanced: { right_time_kom: true },
            time: 'day'
        };
        
        const loaded = result.current.loadFromHistory(historyItem);
        
        expect(loaded).toEqual({
            distance: 10000,
            region: 'Киров',
            regions: ['Коминтерн'],
            address: 'Тестовый адрес',
            duration: 30,
            weight: 500,
            options: { by_time: true, day_of_week: 'monday' },
            vehicle: 0,
            mapDistance: 10000,
            advanced: { right_time_kom: true },
            time: 'day'
        });
    });

    it('should handle missing fields in loadFromHistory with defaults', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        const historyItem = {
            id: 1,
            timestamp: '2024-01-01T00:00:00.000Z'
        };
        
        const loaded = result.current.loadFromHistory(historyItem);
        
        expect(loaded).toEqual({
            distance: 0,
            region: '',
            regions: [],
            address: '',
            duration: 0,
            weight: 100,
            options: {
                by_time: false,
                morning: false,
                evening: false,
                price: false,
                opt: false,
                day_of_week: "none"
            },
            vehicle: 0,
            mapDistance: 0,
            advanced: {},
            time: 'day'
        });
    });

    it('should add multiple calculations to history', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        act(() => {
            result.current.addToHistory({ distance: 10000, weight: 500 });
        });
        
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].distance).toBe(10000);
        
        act(() => {
            // Add another calculation
            result.current.addToHistory({ distance: 20000, weight: 600 });
        });
        
        // Should have 2 items, newest first
        expect(result.current.history).toHaveLength(2);
        expect(result.current.history[0].distance).toBe(20000);
        expect(result.current.history[1].distance).toBe(10000);
    });

    it('should save history to localStorage', () => {
        const { result } = renderHook(() => useCalculationHistory());
        
        act(() => {
            result.current.addToHistory({
                distance: 10000,
                weight: 500
            });
        });
        
        expect(localStorageMock.setItem).toHaveBeenCalled();
        const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
        const savedData = JSON.parse(lastCall[1]);
        expect(savedData).toHaveLength(1);
        expect(savedData[0].distance).toBe(10000);
    });
});

