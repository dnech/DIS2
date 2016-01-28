/*
  Interface  - Этот интерфейс
  Export     - Здесь размещать функции доступные из Клиента
  Timers   	 - Все необходимые таймеры объявлять здесь для корректного сбора мусора
  
  function onInit(type)     - Функция вызываемая когда интерфейс создался
  function onExist()        - Функция вызываемая когда интерфейс существует
  function onDestroy(type)  - Функция вызываемая когда интерфейс уничтожился
*/

function onInit(type) {
	console.log('Интерфейс '+Interface.id+' создан ('+type+').');
} 

function onExist() {
	console.log('Интерфейс '+Interface.id+' существует.');
}

function onDestroy(type) {
	console.log('Интерфейс '+Interface.id+' уничтожен ('+type+').');
} 