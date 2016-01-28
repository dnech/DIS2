/*
  Interface  - Этот интерфейс
  Elements   - Элемент объявленные в HTML атрибутом "xname"
  Timers   	 - Все необходимые таймеры объявлять здесь для корректного сбора мусора
  Server     - Здесь функции объявленные на сервере
  
  function onInit     - Функция вызываемая когда интерфейс создался
  function onDestroy  - Функция вызываемая когда интерфейс уничтожился
*/

	Timers.test = setInterval(function() {
		Server.fn1('', function(answ){
			Elements.Test1.html('Удаленный вызов Серверной функции по таймеру: '+Interface.id+'- '+answ);
			console.log('Удаленный вызов Серверной функции по таймеру: '+Interface.id+'- '+answ);
		});
	}, 3000);

	var idx = 0;
	Timers.test = setInterval(function() {
		idx++;
		Elements.Test2.html('Локальный счетчик по таймеру: '+Interface.id+'- '+idx);
		console.log('Локальный счетчик по таймеру: '+Interface.id+'- '+idx);
	}, 3000);

	/* Предопределенные функции */
	function onInit(){
		Elements.Test1.html('onInit: '+Interface.id);
		console.log('Interface onInit id:'+Interface.id, Interface);
	}
	
	function onDestroy(){
		console.log('Interface onDestroy id:'+Interface.id, Interface);
	}
