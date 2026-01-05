import { useEffect, useRef, useState } from "react";
import Tooltip from "./components/Tooltip";

const KOMINTERN_REGION = "Коминтерн";
const ALLOWED_VEHICLES_FOR_KOMINTERN = [0, 1, 2, 3]; // Все Газели (0.5т, 1т, 1.5т, 2т)

export default function Advanced({ regions, vehicle, advanced, setAdvanced }) {
    const contentRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(0);
    
    const show = regions && regions.includes(KOMINTERN_REGION);
    const isVehicleAllowed = ALLOWED_VEHICLES_FOR_KOMINTERN.includes(vehicle);

    useEffect(() => {
        if (show && contentRef.current) {
            const actualHeight = contentRef.current.clientHeight;
            setContainerHeight(actualHeight);
        } else {
            setContainerHeight(0);
        }
    }, [show, advanced]);

    const handleOptionChange = (option) => {
        setAdvanced(prevOptions => ({
            ...prevOptions,
            [option]: !prevOptions[option]
        }));
    }

    return (
        <>
            <div className={`relative overflow-hidden transition-all mb-1`}
                 style={{height: show ? `${containerHeight}px` : '0px'}}>
                <div ref={contentRef} className=" absolute flex w-full  flex-col max-sm:px-0 pl-2 pt-2 max-sm:text-sm text-md">
                    <label className="font-semibold max-sm:text-lg text-xl">Дополнительно</label>
                    <div className="mt-2 mx-4 flex flex-row  items-center">
                        <input 
                            type="checkbox"
                            id="right_time_kom"
                            name="right_time_kom"
                            checked={advanced.right_time_kom || false}
                            disabled={!isVehicleAllowed}
                            onChange={() => handleOptionChange('right_time_kom')}
                        />
                        <label htmlFor="right_time_kom" className={`mx-2 flex items-center gap-1`}>
                            <Tooltip text="При доставке в район Коминтерн в среду или пятницу на Газели применяется скидка 50%. Минимальная стоимость доставки 800 руб">
                                <span className="flex items-center gap-1">
                                    Коминтерн - доставка в среду или пятницу
                                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
                                </span>
                            </Tooltip>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}