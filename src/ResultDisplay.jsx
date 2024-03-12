import React from 'react';

function ResultDisplay({distance, duration, region, price, weight}) {
    // Style for each row in the results
    const rowStyle = {
        padding: '8px 0', // Add padding for better spacing
        borderBottom: '1px solid #ddd', // Light grey line for separation
    };

    const commentsContainerStyle = {
        maxHeight: '96px', // Adjust based on your line-height and desired number of lines
        overflowY: 'auto',  // Allows scrolling within the container
        padding: '4px 0',   // Add some padding if needed
        borderBottom: '1px solid #ddd', // Retain the border from rowStyle if necessary
    };

    const formatPrice = (price) => {
        if (price === 0) {
            return "Бесплатно";
        } else if (price === -1 || price === undefined || isNaN(price)) {
            return "Нет";
        } else {
            return `${price.toFixed(0)} руб`;
        }
    }

    return (
        <div className="mt-4 mb-auto px-2 py-4 flex flex-col border-t border-gray-200 space-y-2">
            <div style={rowStyle}>
                <div className="flex justify-between">
                    <span className="font-semibold">Расстояние:</span>
                    <span>{distance ? (distance / 1000.0).toFixed(1) : 0} км</span>
                </div>
            </div>
            <div style={rowStyle}>
                <div className="flex justify-between">
                    <span className="font-semibold">Время:</span>
                    <span>{duration ? (duration / 60).toFixed(0) : 0} минут</span>
                </div>
            </div>
            <div style={rowStyle}>
                <div className="flex justify-between">
                    <span className="font-semibold">Регион:</span>
                    <span>{region === "" ? "Неизвестно" : region}</span>
                </div>
            </div>
            <div style={rowStyle}>
                <div className="flex justify-between">
                    <span className="font-semibold">Вес:</span>
                    <span>{weight === "" ? 1 : weight} кг</span>
                </div>
            </div>
            <div style={{...rowStyle, borderBottom: 'none'}}> {/* Adjust if you want other styles from rowStyle */}
                <span className="font-semibold">Комментарии:</span>
                <div style={commentsContainerStyle}>
                    {price.description.map((comment, index) => (
                        <p key={index}> - {comment}</p>
                    ))}
                </div>
            </div>
            {/* Price details with a different style for emphasis */}
            <div className="flex justify-between bg-blue-100 p-4 px-6 rounded-lg" style={{margin: '20px 0'}}>
                <span className="font-semibold text-xl">Стоимость:</span>
                <span className="text-xl font-bold">
                    {formatPrice(price.price)}
                </span>
            </div>

        </div>
    );
}

export default ResultDisplay;
