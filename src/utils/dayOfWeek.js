const LEGACY_WEEKEND_DAYS = ['saturday', 'sunday'];

export const DAY_PERIODS = ['weekdays', 'weekend'];

export function isWeekend(dayOfWeek) {
    return dayOfWeek === 'weekend' || LEGACY_WEEKEND_DAYS.includes(dayOfWeek);
}
