const TIME_OPTIONS = ['by_time', 'morning', 'evening', 'today'];
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function handleOptionChange(option, currentOptions, setOptions) {
    // Handle opt option - resets price when enabled
    if (option === 'opt' && !currentOptions[option]) {
        setOptions(prevOptions => ({
            ...prevOptions,
            [option]: !prevOptions[option],
            price: false
        }));
        return;
    }

    // Handle time options - only one can be selected at a time
    if (TIME_OPTIONS.includes(option)) {
        const newOptions = {
            by_time: false,
            morning: false,
            evening: false,
            today: false,
        };
        newOptions[option] = !currentOptions[option];
        setOptions(prevOptions => ({
            ...prevOptions,
            ...newOptions
        }));
        return;
    }

    // Handle day of week - radio button behavior
    if (DAYS_OF_WEEK.includes(option)) {
        setOptions(prevOptions => ({
            ...prevOptions,
            day_of_week: option
        }));
        return;
    }

    // Default: toggle the option
    setOptions(prevOptions => ({
        ...prevOptions,
        [option]: !prevOptions[option]
    }));
}

export function findNextAvailableVehicle(weight, vehiclesConfig) {
    for (const [key, value] of Object.entries(vehiclesConfig)) {
        if (value.max_weight >= weight) {
            return parseInt(key, 10);
        }
    }
    return 0;
}

