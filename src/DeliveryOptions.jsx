import React from 'react';
import {config} from "../script.jsx";

function DeliveryOptions({ options, handleOptionChange, handlePriceChange }) {
    return (
        <div className="pr-10">
            <div className="mx-2 flex flex-row gap-10 mt-2">
                {/* BY TIME DELIVERY */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="by_time"
                            checked={options.by_time || false}
                            onChange={() => handleOptionChange('by_time')}
                        />
                        <label htmlFor="by_time">
                            Ко времени
                            <span className="ml-2 text-gray-500 text-sm self-center translate-y-0.5">
                                x{config.by_time}
                            </span>
                        </label>
                    </div>
                </div>
                {/* BY TIME DELIVERY */}

                {/* RIGHT NOW DELIVERY */}
{/*                <div className="">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="right_now"
                            checked={options.right_now || false}
                            onChange={() => handleOptionChange('right_now')}
                            disabled={!options.by_time || false}
                        />
                        <label htmlFor="right_now">
                            Прямо сейчас
                            <span className="ml-2 text-gray-500 text-sm self-center translate-y-0.5">
                                x{config.right_now}
                            </span>
                        </label>
                    </div>
                </div>*/}
                {/* RIGHT NOW DELIVERY */}
            </div>
            <div className="mx-2 flex flex-row gap-10 mt-2">
            <div className="">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="price"
                            checked={options.price || false}
                            onChange={() => handleOptionChange('price')}
                        />
                        <label htmlFor="price">Сумма покупки ≥ 10,000 руб</label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeliveryOptions;