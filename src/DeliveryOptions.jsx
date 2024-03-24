import React from 'react';
import { config } from "./script.jsx";

function DeliveryOptions({ options, handleOptionChange, handleTimeChange }) {
    return (
        <div className="pl-2 pt-2 max-sm:text-sm text-md pr-10">
            <div className="grid grid-cols-2 gap-x-1 gap-2">
                <div className="flex flex-row items-start space-x-2"> {/* Adjusted alignment */}
                    <input
                        type="checkbox"
                        id="by_time"
                        checked={options.by_time || false}
                        onChange={() => handleOptionChange('by_time')}
                        className={`self-center`}
                    />
                    <label htmlFor="by_time" className="flex flex-wrap gap-x-2 items-center self-center" > {/* Adjusted alignment */}
                        Ко времени
                        <span className="text-nowrap text-gray-500 text-sm">
                            9:00 - 16:00
                        </span>
                    </label>
                </div>
                <div className="flex flex-row items-start space-x-2"> {/* Adjusted alignment */}
                    <input
                        type="checkbox"
                        id="cement"
                        checked={options.cement || false}
                        onChange={() => handleOptionChange('cement')}
                        className={`self-center`}
                    />
                    <label htmlFor="cement" className="flex flex-wrap gap-x-2 items-center self-center" > {/* Adjusted alignment */}
                        Цемент/ЦПС
                        <span className="text-nowrap text-gray-500 text-sm">
                            более 15 штук
                        </span>
                    </label>
                </div>
                <div className="flex flex-row items-start space-x-2"> {/* Adjusted alignment */}
                    <input
                        type="checkbox"
                        id="price"
                        checked={options.price || false}
                        onChange={() => handleOptionChange('price')}
                        className={`self-center`}
                    />
                    <label htmlFor="price" className="flex flex-wrap gap-x-1 items-center self-center"> {/* Adjusted alignment */}
                        Сумма покупки
                        <span className="font-semibold">{options.opt ? "≥ 15,000 руб" : "≥ 10,000 руб"}</span>
                    </label>
                </div>
                <div className="flex flex-row items-start space-x-2"> {/* Adjusted alignment */}
                    <input
                        type="checkbox"
                        id="price_opt"
                        checked={options.opt || false}
                        onChange={() => handleOptionChange('opt')}
                        className={`self-center`}
                    />
                    <label htmlFor="price_opt" className="self-center flex flex-wrap gap-x-2 items-center"> {/* Adjusted alignment */}
                        Опт
                    </label>
                </div>
            </div>
        </div>
    );
}

export default DeliveryOptions;
