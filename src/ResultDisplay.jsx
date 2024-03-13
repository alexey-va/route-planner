import React from 'react';

function ResultDisplay({distance, duration, region, price, weight}) {
    // Convert the function to use Tailwind for consistency and improved design
    const formatPrice = (priceValue) => {
        if (priceValue === 0) {
            return "Бесплатно";
        } else if (priceValue === -1 || priceValue === undefined || isNaN(priceValue)) {
            return "Нет";
        } else {
            return `${priceValue.toFixed(0)} руб`;
        }
    };

    return (
        <div className="mt-4 mb-auto py-4 flex flex-col border-t border-gray-200 space-y-2">
            {/* Other details remain the same */}
            <div className="flex flex-col space-y-2 px-2">
                <div className="flex justify-between">
                    <span className="font-semibold">Расстояние:</span>
                    <span>{distance ? (distance / 1000.0).toFixed(1) : 0} км</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Район:</span>
                    <span>{region || "Неизвестно"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Вес:</span>
                    <span>{weight || 1} кг</span>
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-4 py-4 px-2 border-t border-gray-200">
                <span className="font-semibold text-lg">Комментарии:</span>
                {price.description.length > 0 ? (
                    <ul className="list-disc list-outside mt-2 bg-gray-50 p-2 rounded-lg border border-gray-300 pl-8"> {/* Adjusted padding and list style */}
                        {price.description.map((comment, index) => (
                            <li key={index} className="mt-0 break-words"> {/* Ensures words break properly */}
                                {comment}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-300 text-gray-500">Нет
                        комментариев.</div>
                )}
            </div>

            {/* Price Details */}
            <div className="flex justify-between bg-blue-100 p-4 rounded-lg mt-4">
                <span className="font-semibold text-xl">Стоимость:</span>
                <span className="text-xl font-bold">
                    {formatPrice(price.price)}
                </span>
            </div>
        </div>
    );
}

export default ResultDisplay;
