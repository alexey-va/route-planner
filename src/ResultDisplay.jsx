function ResultDisplay({distance, duration, region, address, price, weight, mapDistance, regions, reset}) {
    // Convert the function to use Tailwind for consistency and improved design
    const formatPrice = (priceValue) => {
        if (priceValue === 0) {
            return "Бесплатно";
        } else if (priceValue === -1 || priceValue === undefined || isNaN(priceValue)) {
            return "Нет";
        } else if (priceValue === -2) {
            return "Рассчитайте вручную";
        } else {
            return `${priceValue.toFixed(0)} руб`;
        }
    };


    return (
        <div className="mt-2 mb-auto py-2 flex flex-col border-t border-gray-200 space-y-2 max-sm:text-sm text-md">
            {/* Other details remain the same */}
            <div className="flex flex-col space-y-2 px-2">
                <div className="flex justify-between relative">
                    <span className="font-semibold">Расстояние:</span>
                    <span
                        className="absolute left-[7rem] font-semibold text-red-600 ml-[3rem]">{distance && Math.abs(distance - mapDistance) > 99.9 ? "Установлено вручную" : ""}</span>
                    <span>{distance ? (distance / 1000.0).toFixed(1) : 0} км</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Район:</span>
                    <span>
                        <span>{region || "Неизвестно"}</span>
                        {/*<span>{regions && regions.length > 0 ? ` (${regions.join(', ')})` : ""}</span>*/}
                    </span>

                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Адрес:</span>
                    <span>{address || "Неизвестно"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Вес:</span>
                    <span>{weight || 1} кг</span>
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-2 pt-2 px-2 border-t border-gray-200 max-sm:text-sm text-md">
                <span className="font-semibold text-lg">Комментарии:</span>
                {/* Create a new array with at least three elements */}
                <ul className="list-disc list-outside p-2 rounded-lg pl-8">
                    {(price.description.length > 0 ? price.description : []).concat(Array(Math.max(0, 3 - price.description.length)).fill('')).map((comment, index) => (
                        <li key={index}
                            className={`mt-0 break-words ${!comment && 'opacity-0'}`}> {/* Apply opacity-0 for empty comments */}
                            {comment || 'Пустой комментарий'} {/* Display placeholder text or nothing */}
                        </li>
                    ))}
                </ul>
                {price.description.length === 0 && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-300 text-gray-500">Нет
                        комментариев.</div>
                )}
            </div>

            {/* Price Details */}
            <div
                className="mx-2 flex justify-between bg-blue-100 max-sm:p-2 text-2xl max-sm:text-xl p-4 rounded-lg mt-2">
                <span className="font-semibold">Стоимость:</span>
                <span className="font-bold">
                    {formatPrice(price.price)}
                </span>
            </div>
            <div className="px-2">
                <button
                    className="hover:bg-blue-600 bg-blue-500 transition-all w-full max-sm:p-2 mt-0 rounded-md text-white p-3  max-sm:text-xl text-3xl "
                    onClick={reset}>Сбросить
                </button>
            </div>
        </div>
    );
}

export default ResultDisplay;
