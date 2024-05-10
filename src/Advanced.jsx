import {useEffect, useRef, useState} from "react";

export default function Advanced({regions, vehicle, advanced, setAdvanced}) {
    const contentRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(0);
    let show = regions && regions.includes("Коминтерн");

    const updateHeight = () => {
        if (show && contentRef.current) {
            const actualHeight = contentRef.current.clientHeight;
            setContainerHeight(actualHeight);
        } else {
            setContainerHeight(0);
        }
    };

    useEffect(() => {
        updateHeight();
    }, [regions, advanced]);

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
                        <input type="checkbox"
                               id="right_time_kom"
                               name="right_time_kom"
                               checked={advanced.right_time_kom || false}
                               disabled={vehicle && (vehicle !== 0 && vehicle !== 1)}
                               onChange={() => handleOptionChange('right_time_kom')}
                        />
                        <label htmlFor="right_time_kom" className={`mx-2`}>
                            Коминтерн - доставка в среду или пятницу
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}