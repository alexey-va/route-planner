import React from 'react';

function DeliveryOptions({options, handleOptionChange, advanced, regions, vehicle}) {
    let hideTime = advanced && advanced.right_time_kom
        && regions && regions.includes("Коминтерн")
        && (vehicle === 0 || vehicle === 1);
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
                            Ко времени (9:00-16:00)
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
                               className="whitespace-nowrap ml-2 max-xs:ml-1 max-xs:text-xs flex flex-wrap items-center self-center">
                            12:00-16:00
                        </label>
                    </div>
                </div>
            </div>
            {/* Time options */}
            <hr/>
            {/* Day options */}
            <div className="max-sm:px-2 max-sm:py-2  px-4 py-2 grid grid-cols-2  rounded-lg relative">
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
            </div>
            {/* Day options */}
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
                            <span className="">{options.opt ? "≥ 20,000 руб" : "≥ 15,000 руб"}</span>
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
