import React from 'react';

function DeliveryOptions({options, handleOptionChange, advanced, regions}) {
    let hideTime = advanced && advanced.right_time_kom && regions && regions.includes("Коминтерн");
    return (
        <div className="max-sm:px-0 pl-2 pt-2 max-sm:text-sm text-md">
            {/* Time options */}
            <div className="max-sm:px-2 max-sm:py-2  px-4 py-2  rounded-lg relative">
                <div className="flex flex-row auto-cols-auto max-sm:gap-x-3 gap-x-10">
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="by_time"
                            disabled={hideTime}
                            checked={options.by_time || false}
                            onChange={() => handleOptionChange('by_time')}
                            className="self-center"
                        />
                        <label htmlFor="by_time" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center">
                            Ко времени
                            <span className={`ml-1 sm:translate-y-0.5 text-red-600 text-sm`}>9:00-16:00</span>
                        </label>
                    </div>

                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="morning"
                            disabled={hideTime}
                            checked={options.morning || false}
                            onChange={() => handleOptionChange('morning')}
                            className="self-center"
                        />
                        <label htmlFor="morning"
                               className="max-sm:ml-1 ml-2 max-xs:text-xs flex flex-wrap items-center self-center">
                            9:00-12:00
                        </label>
                    </div>
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="evening"
                            disabled={hideTime}
                            checked={options.evening || false}
                            onChange={() => handleOptionChange('evening')}
                            className="self-center"
                        />
                        <label htmlFor="evening"
                               className="ml-2 max-xs:ml-1 max-xs:text-xs flex flex-wrap items-center self-center">
                            12:00-16:00
                        </label>
                    </div>
                </div>
            </div>
            {/* Time options */}
            <hr/>
            {/* Price options */}
            <div className="max-sm:px-2 max-sm:py-2 px-4 py-2 rounded-lg">
                <div className="flex flex-row auto-cols-auto max-sm:gap-x-3 gap-x-10">
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="price"
                            checked={options.price || false}
                            onChange={() => handleOptionChange('price')}
                            className="self-center"
                        />
                        <label htmlFor="price"
                               className="flex ml-2 max-sm:ml-1 flex-wrap gap-x-1 items-center self-center">
                            Сумма покупки
                            <span className="">{options.opt ? "≥ 15,000 руб" : "≥ 10,000 руб"}</span>
                        </label>
                    </div>
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="price_opt"
                            checked={options.opt || false}
                            onChange={() => handleOptionChange('opt')}
                            className="self-center"
                        />
                        <label htmlFor="price_opt"
                               className="self-center ml-2 max-sm:ml-1  flex flex-wrap gap-x-2 items-center">
                            Опт
                        </label>
                    </div>
                </div>
            </div>
            {/* Price options */}
            <hr/>
            {/* Cement options */}
            <div className="max-sm:px-2 max-sm:py-2 px-4 py-2 rounded-lg">
                <div className="grid grid-flow-col auto-cols-auto gap-x-1">
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="cement"
                            checked={options.cement || false}
                            onChange={() => handleOptionChange('cement')}
                            className="self-center"
                        />
                        <label htmlFor="cement"
                               className="flex  ml-2 max-sm:ml-1  flex-wrap gap-x-2 items-center self-center">
                            Цемент/ЦПС
                            <span className="text-nowrap text-gray-500 text-sm">
                                более 15 штук
                            </span>
                        </label>
                    </div>
                </div>
            </div>
            {/* Cement options */}
            <hr/>
        </div>
    );
}

export default DeliveryOptions;
