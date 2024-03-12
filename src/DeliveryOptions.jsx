import React from 'react';

function DeliveryOptions({ options, handleOptionChange }) {
    return (
        <div className="mt-4">
            <label className="font-semibold text-xl">Настройки</label>
            <div className="mx-2 flex flex-row gap-10 mt-4">
                {/* BY TIME DELIVERY */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="option1"
                            checked={options.by_time}
                            onChange={() => handleOptionChange('by_time')}
                        />
                        <label htmlFor="option1">Срочно</label>
                    </div>
                </div>
                {/* BY TIME DELIVERY */}

                {/* RIGHT NOW DELIVERY */}
                <div className="">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="option4"
                            checked={options.right_now}
                            onChange={() => handleOptionChange('right_now')}
                            disabled={!options.by_time}
                        />
                        <label htmlFor="option4">Прямо сейчас</label>
                    </div>
                </div>
                {/* RIGHT NOW DELIVERY */}
            </div>
        </div>
    );
}

export default DeliveryOptions;