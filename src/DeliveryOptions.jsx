import React from 'react';
import { getFieldValidationClass } from './utils/validation';
import Tooltip from './components/Tooltip';

function DeliveryOptions({options, handleOptionChange, advanced, regions, vehicle, validationErrors = {}, validationWarnings = {}, orderTotal = 0, setOrderTotal}) {
    // Все Газели (0.5т, 1т, 1.5т, 2т) - индексы 0-3
    let hideTime = advanced && advanced.right_time_kom
        && regions && regions.includes("Коминтерн")
        && (vehicle >= 0 && vehicle <= 3);
    return (
        <div className="max-sm:px-0 pl-2 pt-2 max-sm:text-sm text-md">
            {/* Time options */}
            <div className="max-sm:px-2 max-sm:py-2  px-4 py-2  rounded-lg relative">
                <div className="grid grid-rows-2 grid-cols-2 gap-x-2 gap-y-2 max-sm:gap-x-16">
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
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                            <Tooltip text="Доставка к конкретному времени в указанном диапазоне. Увеличивает стоимость на 70%">
                                <span className="flex items-center gap-1">
                                    Ко времени (9:00-16:00)
                                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                </span>
                            </Tooltip>
                        </label>
                    </div>

                    {/*<div className="flex flex-row items-start">*/}
                    {/*    <input*/}
                    {/*        type="checkbox"*/}
                    {/*        id="today"*/}
                    {/*        disabled={hideTime}*/}
                    {/*        checked={options.today || false}*/}
                    {/*        onChange={() => handleOptionChange('today')}*/}
                    {/*        className="self-center"*/}
                    {/*    />*/}
                    {/*    <label htmlFor="today" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1*/}
                    {/*     max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">*/}
                    {/*        Сегодня*/}
                    {/*    </label>*/}
                    {/*</div>*/}

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
                               className="whitespace-nowrap max-sm:ml-1 ml-2 max-xs:text-xs flex flex-wrap items-center self-center">
                            <Tooltip text="Доставка в утреннее время. Надбавка +500 руб">
                                <span className="flex items-center gap-1">
                                    9:00-12:00
                                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                </span>
                            </Tooltip>
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
                               className="whitespace-nowrap ml-2 max-xs:ml-1 max-xs:text-xs flex flex-wrap items-center self-center">
                            <Tooltip text="Доставка в вечернее время. Надбавка +300 руб">
                                <span className="flex items-center gap-1">
                                    12:00-16:00
                                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                </span>
                            </Tooltip>
                        </label>
                    </div>
                </div>
            </div>
            {/* Time options */}
            <hr/>
            {/* Day options */}
            <div className={`max-sm:px-2 max-sm:py-2  px-4 py-2 grid grid-cols-2 rounded-lg relative ${
                validationErrors.day_of_week ? 'border-2 border-red-500 bg-red-50' : ''
            }`}>
                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="monday"
                        checked={options.day_of_week === "monday" || false}
                        onChange={() => handleOptionChange('monday')}
                        className="self-center"
                    />
                    <label htmlFor="monday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Понедельник
                    </label>
                </div>
                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="tuesday"
                        checked={options.day_of_week === "tuesday" || false}
                        onChange={() => handleOptionChange('tuesday')}
                        className="self-center"
                    />
                    <label htmlFor="tuesday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Вторник
                    </label>
                </div>


                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="wednesday"
                        checked={options.day_of_week === "wednesday" || false}
                        onChange={() => handleOptionChange('wednesday')}
                        className="self-center"
                    />
                    <label htmlFor="wednesday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Среда
                    </label>
                </div>
                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="thursday"
                        checked={options.day_of_week === "thursday" || false}
                        onChange={() => handleOptionChange('thursday')}
                        className="self-center"
                    />
                    <label htmlFor="thursday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Четверг
                    </label>
                </div>
                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="friday"
                        checked={options.day_of_week === "friday" || false}
                        onChange={() => handleOptionChange('friday')}
                        className="self-center"
                    />
                    <label htmlFor="friday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Пятница
                    </label>
                </div>
                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="saturday"
                        checked={options.day_of_week === "saturday" || false}
                        onChange={() => handleOptionChange('saturday')}
                        className="self-center"
                    />
                    <label htmlFor="saturday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Суббота
                    </label>
                </div>
                <div className="flex flex-row items-start">
                    <input
                        type="radio"
                        id="sunday"
                        checked={options.day_of_week === "sunday" || false}
                        onChange={() => handleOptionChange('sunday')}
                        className="self-center"
                    />
                    <label htmlFor="sunday" className="relative max-sm:ml-1 max-sm:gap-x-1 ml-2 gap-x-1.5 max-xs:ml-1
                         max-xs:text-xs flex flex-wrap items-center self-center whitespace-nowrap">
                        Воскресенье
                    </label>
                </div>
                {validationErrors.day_of_week && (
                    <div className="col-span-2 mt-2">
                        <p className="text-red-500 text-sm font-semibold">
                            ⚠️ {validationErrors.day_of_week}
                        </p>
                    </div>
                )}
            </div>
            {/* Day options */}
            <hr/>
            {/* Retail / Wholesale options */}
            <div className="max-sm:px-2 max-sm:py-2 px-4 py-2 rounded-lg">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="retail"
                            checked={options.retail || false}
                            onChange={() => handleOptionChange('retail')}
                            className="self-center"
                        />
                        <label htmlFor="retail"
                               className="flex ml-2 max-sm:ml-1 flex-wrap gap-x-2 items-center self-center">
                            <Tooltip text="Розница. При заказе от 20 000 руб — бесплатная доставка (в пределах города или Коминтерна, без доставки к конкретному времени, машина до 1.5 т)">
                                <span className="flex items-center gap-1">
                                    Розница
                                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                </span>
                            </Tooltip>
                        </label>
                    </div>
                    <div className="flex flex-row items-start">
                        <input
                            type="checkbox"
                            id="opt"
                            checked={options.opt || false}
                            onChange={() => handleOptionChange('opt')}
                            className="self-center"
                        />
                        <label htmlFor="opt"
                               className="flex ml-2 max-sm:ml-1 flex-wrap gap-x-2 items-center self-center">
                            <Tooltip text="Опт. При заказе от 25 000 руб — бесплатная доставка (в пределах города или Коминтерна, без доставки к конкретному времени, машина до 1.5 т)">
                                <span className="flex items-center gap-1">
                                    Опт
                                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                </span>
                            </Tooltip>
                        </label>
                    </div>
                </div>
                {/* Order total input - shown when retail or opt is selected */}
                {(options.retail || options.opt) && (
                    <div className="mt-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="orderTotal" className="text-sm text-gray-600">
                                Сумма заказа:
                            </label>
                            <input
                                type="number"
                                id="orderTotal"
                                value={orderTotal || ''}
                                onChange={(e) => setOrderTotal(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className={`w-32 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                                    validationErrors.orderTotal 
                                        ? 'border-red-500 border-2 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            <span className="text-sm text-gray-500">руб</span>
                        </div>
                        {validationErrors.orderTotal && (
                            <p className="text-red-500 text-xs mt-1 ml-0">
                                ⚠️ {validationErrors.orderTotal}
                            </p>
                        )}
                    </div>
                )}
            </div>
            {/* Retail / Wholesale options */}
            <hr/>
        </div>
    );
}

export default DeliveryOptions;
