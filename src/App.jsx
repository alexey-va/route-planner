import Test from "./Test.jsx";
import { useEffect, useState } from "react";

function App() {
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [weight, setWeight] = useState(1);
    const [options, setOptions] = useState({
        option1: false,
        option2: false,
        option3: false,
        option4: false
    });
    const [price, setPrice] = useState(0);

    useEffect(() => {
        // Calculate price whenever distance, duration, or weight changes
        let params = {
            distance: distance,
            duration: duration,
            weight: weight,
            options: options
        };
        const calculatedPrice = calculate(params);
        setPrice(calculatedPrice);
    }, [distance, duration, weight, options]);

    const handleOptionChange = (option) => {
        if (option === 'option1' && options[option]) {
            setOptions(prevOptions => ({
                ...prevOptions,
                [option]: !prevOptions[option],
                option4: false
            }));
        } else {
            setOptions(prevOptions => ({
                ...prevOptions,
                [option]: !prevOptions[option]
            }));
        }
    };

    return (
        <div className="w-full h-screen bg-gray-500 flex justify-center items-center">
            <div className="bg-white w-3/4 h-3/4 max-md:w-full max-md:h-full max-md:rounded-none drop-shadow-2xlp-8 flex flex-col">
                <div className="w-full h-full">
                    <Test setDistance={setDistance} setDuration={setDuration}/>
                </div>
                <hr className="bg-gray-400 h-0.5"/>
                <div className="p-4 text-lg font-sans font-normal flex flex-col h-full">
                    <label htmlFor="weight" className="font-semibold text-xl">Вес (кг):</label>
                    <input
                        type="number"
                        id="weight"
                        min={1}
                        placeholder={1}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                    <div className="mt-4">
                        <label className="font-semibold text-xl">Настройки</label>
                        <div className="flex flex-row gap-10 mt-4">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="option1"
                                        checked={options.option1}
                                        onChange={() => handleOptionChange('option1')}
                                    />
                                    <label htmlFor="option1">Срочно</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="option2"
                                        checked={options.option2}
                                        onChange={() => handleOptionChange('option2')}
                                    />
                                    <label htmlFor="option2">Опция 2</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="option3"
                                        checked={options.option3}
                                        onChange={() => handleOptionChange('option3')}
                                    />
                                    <label htmlFor="option3">Опция 3</label>
                                </div>
                            </div>
                            <div className="">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="option4"
                                        checked={options.option4}
                                        onChange={() => handleOptionChange('option4')}
                                        disabled={!options.option1}
                                    />
                                    <label htmlFor="option4">Прямо сейчас</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 w-full bg-gray-200 h-0.5"/>
                    <div className="mb-auto px-6 py-4 mt-auto">
                        <div className="flex justify-between">
                            <span>Расстояние: {distance ? (distance / 1000.0).toFixed(1) : 0} км</span>
                            <span>Время: {duration ? (duration / 60).toFixed(0) : 0} минут</span>
                        </div>
                        <div className="flex justify-between mt-4">
                            <span>Стоимость: {isNaN(price) ? 0 : price.toFixed(1)} руб</span>
                            <span>Вес: {weight === "" ? 1 : weight} кг</span>
                        </div>
                    </div>
                    {/*<button className="mt-auto rounded-md text-white p-4 text-3xl bg-blue-600" onClick={() => calculate()}>Расчитать</button>*/}
                </div>
            </div>
        </div>
    )
}

export default App;
