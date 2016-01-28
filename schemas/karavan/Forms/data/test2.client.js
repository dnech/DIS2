/*
  Interface  - Этот интерфейс
  Elements   - Элемент объявленные в HTML атрибутом "xname"
  Timers   	 - Все необходимые таймеры объявлять здесь для корректного сбора мусора
  Server     - Здесь функции объявленные на сервере
  
  function onInit     - Функция вызываемая когда интерфейс создался
  function onDestroy  - Функция вызываемая когда интерфейс уничтожился
*/

/* Начало блока ручной настройки */



/* Предопределенные функции */
function onInit(){
	  
	  var topPos = $('.floating').offset().top; //topPos - это значение от верха блока до окна браузера
	  $(window).scroll(function() { 
	   var top = $(document).scrollTop();
	   if (top+10 > topPos) $('.floating').addClass('fixed'); 
	   else $('.floating').removeClass('fixed');
	  });
  
	
	CKEDITOR.replace('editor1');
    Elements.Wysi.wysihtml5();
	
	
	//Initialize Select2 Elements
        $(".select2").select2({
			language: "ru"
		});

        //Datemask dd/mm/yyyy
        $("#datemask").inputmask("dd.mm.yyyy", {"placeholder": "дд.мм.гггг"});
        //Datemask2 mm/dd/yyyy
        $("#datemask2").inputmask("mm.dd.yyyy", {"placeholder": "мм.дд.гггг"});
        //Money Euro
        $("[data-mask]").inputmask();

        //Date range picker
        $('#reservation').daterangepicker();
        //Date range picker with time picker
        $('#reservationtime').daterangepicker({
			language: "ru",
			timePicker: true,
			timePickerIncrement: 30,
			format: 'DD.MM.YYYY hh:mm'
		});
        //Date range as a button
        $('#daterange-btn').daterangepicker(
            {
              language: "ru",
			  ranges: {
                'Сегодня': [moment(), moment()],
                'Вчера': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Последние 7 дней': [moment().subtract(6, 'days'), moment()],
                'Последние 30 дней': [moment().subtract(29, 'days'), moment()],
                'Текущий месяц': [moment().startOf('month'), moment().endOf('month')],
                'Прошлый месяц': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
              },
              startDate: moment().subtract(29, 'days'),
              endDate: moment()
            },
        function (start, end) {
          $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        );

        //iCheck for checkbox and radio inputs
        $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
          checkboxClass: 'icheckbox_minimal-blue',
          radioClass: 'iradio_minimal-blue'
        });
        //Red color scheme for iCheck
        $('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
          checkboxClass: 'icheckbox_minimal-red',
          radioClass: 'iradio_minimal-red'
        });
        //Flat red color scheme for iCheck
        $('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
          checkboxClass: 'icheckbox_flat-green',
          radioClass: 'iradio_flat-green'
        });

        //Colorpicker
        $(".my-colorpicker1").colorpicker();
        //color picker with addon
        $(".my-colorpicker2").colorpicker();

        //Timepicker
        $(".timepicker").timepicker({
		  //template: false,
		  showMeridian: false,
          showInputs: false,
		  explicitMode: true
        });
		
	console.log('Interface onInit id:'+Interface.id, Interface);
}
	
function onDestroy(){
	console.log('Interface onDestroy id:'+Interface.id, Interface);
}