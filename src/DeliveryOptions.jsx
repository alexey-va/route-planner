import React from 'react';
import {config} from "./script.jsx";

function DeliveryOptions({options, handleOptionChange, handleTimeChange}) {
    return (
        <div className="pr-10">
            <div className="mx-2 flex flex-row gap-10 mt-2">
                {/* BY TIME DELIVERY */}
                <div className="flex flex-row space-x-[8.75rem]">
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
                                9:00 - 16:00
                            </span>
                            {/*                         <span className="ml-2 text-gray-500 text-sm self-center translate-y-0.5">
                                x{config.by_time}
                            </span>*/}
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="cement"
                            checked={options.cement || false}
                            onChange={() => handleOptionChange('cement')}
                        />
                        <label htmlFor="by_time">
                            Цемент/ЦПС
                            <span className="ml-2 text-gray-500 text-sm self-center translate-y-0.5">
                                более 15 штук
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
                        <label htmlFor="price">
                            Сумма покупки
                            <span className={"font-semibold mx-1"}>{options.opt ? "≥ 15,000" : "≥ 10,000"}</span>
                            руб
                        </label>
                    </div>
                </div>
                <div className="">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="price_opt"
                            checked={options.opt || false}
                            onChange={() => handleOptionChange('opt')}
                        />
                        <label htmlFor="price_opt">
                            Опт
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeliveryOptions;