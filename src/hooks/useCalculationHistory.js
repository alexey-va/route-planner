import { useState, useEffect, useCallback } from 'react';

const HISTORY_STORAGE_KEY = 'calculation_history';
const MAX_HISTORY_ITEMS = 20; // Максимальное количество сохраненных расчетов

export function useCalculationHistory() {
    const [history, setHistory] = useState(() => {
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load calculation history:', error);
            return [];
        }
    });

    // Сохраняем историю в localStorage при изменении
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save calculation history:', error);
        }
    }, [history]);

    // Добавить расчет в историю
    const addToHistory = useCallback((calculationData) => {
        setHistory(prev => {
            const newItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...calculationData
            };
            
            // Добавляем в начало и ограничиваем размер
            const updated = [newItem, ...prev];
            return updated.slice(0, MAX_HISTORY_ITEMS);
        });
    }, []);

    // Удалить расчет из истории
    const removeFromHistory = useCallback((id) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, []);

    // Очистить всю историю
    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    // Загрузить расчет из истории
    const loadFromHistory = useCallback((historyItem) => {
        return {
            distance: historyItem.distance || 0,
            region: historyItem.region || '',
            regions: historyItem.regions || [],
            address: historyItem.address || '',
            duration: historyItem.duration || 0,
            weight: historyItem.weight || 1,
            options: historyItem.options || {
                by_time: false,
                morning: false,
                evening: false,
                price: false,
                opt: false,
                day_of_week: "none"
            },
            vehicle: historyItem.vehicle || 0,
            mapDistance: historyItem.mapDistance || 0,
            advanced: historyItem.advanced || {},
            time: historyItem.time || 'day'
        };
    }, []);

    return {
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        loadFromHistory
    };
}

