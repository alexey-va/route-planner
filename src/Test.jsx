import {useEffect, useState} from "react";

function Test({setDistance, setDuration}) {



    useEffect(() => {
        ymaps.ready(init);
    }, []);


    function init() {
        // Стоимость за километр.
        var myMap = new ymaps.Map('map', {
                center: [58.565190, 49.605433],
                zoom: 15,
                controls: []
            }),
            // Создадим панель маршрутизации.
            routePanelControl = new ymaps.control.RoutePanel({
                options: {
                    // Добавим заголовок панели.
                    showHeader: true,
                    title: 'Расчёт доставки',
                    maxWidth: 500,
                }
            }),
            zoomControl = new ymaps.control.ZoomControl({
                options: {
                    size: 'small',
                    float: 'none',
                    position: {
                        bottom: 145,
                        right: 10
                    }
                }
            });
        // Пользователь сможет построить только автомобильный маршрут.
        routePanelControl.routePanel.options.set({
            types: {auto: true}
        });

        // Если вы хотите задать неизменяемую точку "откуда", раскомментируйте код ниже.
/*        routePanelControl.routePanel.state.set({
            fromEnabled: true,
            from: 'Киров, Коммунальная 5'
         });*/

        myMap.controls.add(routePanelControl).add(zoomControl);

        // Получим ссылку на маршрут.
        routePanelControl.routePanel.getRouteAsync().then(function (route) {

            // Зададим максимально допустимое число маршрутов, возвращаемых мультимаршрутизатором.
            route.model.setParams({results: 1}, true);

            // Повесим обработчик на событие построения маршрута.
            route.model.events.add('requestsuccess', function () {

                var activeRoute = route.getActiveRoute();
                if (activeRoute) {
                    // Получим протяженность маршрута.
                    console.log(route.getActiveRoute().properties);
                    var duration = route.getActiveRoute().properties.get("duration");
                    var length = route.getActiveRoute().properties.get("distance");
                    setDistance(length.value)
                    setDuration(duration.value)

                    let obj = {
                        distance: length.value,
                        time: duration.value
                    }

                    var price = calculate(obj);
                    let balloonContentLayout = ymaps.templateLayoutFactory.createClass(
                        '<span>Расстояние: ' + length.text + '.</span><br/>'
                        //+ '<span style="font-weight: bold; font-style: italic">Стоимость доставки: ' + price + ' р.</span>'
                    );
                    // Зададим этот макет для содержимого балуна.
                    route.options.set('routeBalloonContentLayout', balloonContentLayout);
                    // Откроем балун.
                    activeRoute.balloon.open();
                }
            });

        });
        // Функция, вычисляющая стоимость доставки.
    }

    return (
        <>
            <div className="w-full h-full bg-gray-100" id="map"></div>
        </>
    );
}

export default Test;