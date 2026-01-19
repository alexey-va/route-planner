/**
 * Валидация полей формы расчета
 */

export const validateFields = (distance, weight, options, region, mapDistance = 0, orderTotal = 0) => {
    const errors = {};
    const warnings = {};

    // Обязательные поля
    // Расстояние может быть введено вручную или выбрано на карте
    const hasDistance = (distance && distance > 0) || (mapDistance && mapDistance > 0);
    if (!hasDistance) {
        errors.distance = 'Укажите расстояние или выберите точку на карте';
    }

    if (!weight || weight <= 0) {
        errors.weight = 'Укажите вес груза';
    } else if (weight < 1) {
        warnings.weight = 'Минимальный вес 1 кг';
    }

    if (!options.day_of_week || options.day_of_week === 'none') {
        errors.day_of_week = 'Выберите день недели';
    }

    // Сумма заказа обязательна при выборе оплаты наличными или СБП
    if ((options.pay_cash || options.pay_sbp) && (!orderTotal || orderTotal <= 0)) {
        errors.orderTotal = 'Укажите сумму заказа';
    }

    // Предупреждения
    // Используем расстояние из поля или с карты
    const effectiveDistance = distance > 0 ? distance : mapDistance;
    if (effectiveDistance > 0 && effectiveDistance < 1000) {
        warnings.distance = 'Расстояние менее 1 км';
    }

    if (!region || region.trim() === '') {
        warnings.region = 'Район не указан';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings
    };
};

export const getFieldValidationClass = (hasError, hasWarning) => {
    if (hasError) {
        return 'border-red-500 border-2 focus:ring-red-500 focus:border-red-500';
    }
    if (hasWarning) {
        return 'border-yellow-400 border-2 focus:ring-yellow-400 focus:border-yellow-400';
    }
    return 'border-gray-300';
};

