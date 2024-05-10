export default function Advanced({regions, vehicle, advanced, setAdvanced}) {

    let show = regions && regions.includes("Коминтерн");

    const handleOptionChange = (option) => {
        setAdvanced(prevOptions => ({
            ...prevOptions,
            [option]: !prevOptions[option]
        }));
    }

    return (
        <>
            <div className={`relative overflow-hidden ${(show ? "h-[5rem]" : "h-0")} transition-all`}>
                <div className="absolute flex  w-full h-full flex-col
                max-sm:px-0 pl-2 pt-2 max-sm:text-sm text-md">
                    <label className="font-semibold max-sm:text-lg text-xl">Дополнительно</label>
                    <div className="mt-3 mx-4">
                        <input type="checkbox"
                               id="right_time_kom"
                               name="right_time_kom"
                               checked={advanced.right_time_kom || false}
                               onChange={() => handleOptionChange('right_time_kom')}
                        />
                        <label htmlFor="right_time_kom" className={`mx-2`}>
                            Доставка в Коминтерн в среду или пятницу
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}