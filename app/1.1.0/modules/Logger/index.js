/*  MODULE LOGGER */	
module.exports = (function(){
	var Required = [];
	var Module   = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		var util   = require('util');
		var VError = require('verror');
		
		// ********** PRIVATE **********
		
		var ModuleList = {};
		
		/*
			0 все атрибуты по умолчанию
			1 жирный шрифт (интенсивный цвет)
			2 полу яркий цвет (тёмно-серый, независимо от цвета)
			4 выделение (ярко-белый, независимо от цвета)
			5 мигающий
			7 реверсия (знаки приобретают цвет фона, а фон -- цвет знаков)
			22 установить нормальную интенсивность
			24 отменить подчеркивание
			25 отменить мигание
			27 отменить реверсию
			-ТЕКСТ-
			30 чёрный цвет знаков
			31 красный цвет знаков
			32 зелёный цвет знаков
			33 коричневый цвет знаков
			34 синий цвет знаков
			35 фиолетовый цвет знаков
			36 цвет морской волны знаков
			37 серый цвет знаков
			-ФОН-
			40 чёрный цвет фона
			41 красный цвет фона
			42 зелёный цвет фона
			43 коричневый цвет фона
			44 синий цвет фона
			45 фиолетовый цвет фона
			46 цвет морской волны фона
			47 серый цвет фона
		*/
		
		// Color
		function color(cod, str, disable) {
			if (disable) {return str;}
			return '\033['+cod+'m'+str+'\033[0m';
		}
		
		// TimeStamp
		function timestamp(date, time, milliseconds) {
			var ts_ = new Date(),
				dy = ('0'+ts_.getDate()).substr(-2),			//	Set the day as a number (1-31)
				yy = ts_.getFullYear(),							//	Set the year (optionally month and day)
				hr = ('0'+ts_.getHours()).substr(-2),			//	Set the hour (0-23)
				ms = ('00'+ts_.getMilliseconds()).substr(-3),	//	Set the milliseconds (0-999)
				mi = ('0'+ts_.getMinutes()).substr(-2),			//	Set the minutes (0-59)
				mo = ('0'+(ts_.getMonth()+1)).substr(-2),		//	Set the month (0-11)
				sc = ('0'+ts_.getSeconds()).substr(-2),			//	Set the seconds (0-59)
				tm = ts_.getTime();								//	Set the time (milliseconds since January 1, 1970)
				
			var _dt = '', _tm = '', _ms = '';	
			if (date) {_dt = yy+'.'+mo+'.'+dy;}
			if (time) {_tm = hr+':'+mi+':'+sc;}
			if (milliseconds) {_ms = '.'+ms;}
			
			return '['+_dt+((date && time)?' ':'')+_tm+_ms+']';
		}
		
		// Logger
		function logger(module, type, arg){
			var config = ModuleList[module];
			if (config && config.enable){
				var param = config.type[type] || config.type['trace'],
					ts = (config.date || config.time || config.milliseconds) ?  color('33', timestamp(config.date, config.time, config.milliseconds), !config.color)+' ' : '',
					md = (config.modulename) ?  ' '+color('2;32', module+':', !config.color) : '';
				
				if ( param.level >= config.level ) {
					var args  = [config.prefix+ts+color(param.color, param.name, !config.color)+md];
					for (var i = 0; i < arg.length; i++) {args.push(arg[i]);}
					console.log.apply(this, args);
				}
			}
		}
		
		// time
		function time(module, name, begin) {
			var config = ModuleList[module];
			if (config && config.enable){
				var param = config.type['trace'],
					md = (config.modulename) ?  ' '+color('2;32', module+': ', !config.color) : '';
				if ( param.level >= config.level ) {
					var title = color(param.color, param.name, !config.color)+md+name;
					if (begin) {console.time(title);} else {console.timeEnd(title);}
				}
			}
		};
		
		function config(module, cfg){
			ModuleList[module] = App.utils.extend(true, ModuleList[module], cfg);
		};
		
		function getTypeFunction(module, key){
			return function(){logger(module, key, arguments);}
		}; 
		
		// ********** PUBLIC **********
		
		// MAIN OBJECT
		me.console = function(module, cfg){
			ModuleList[module] = me.config.default;
			if (typeof cfg == 'object') {config(module, cfg);}
			var obj = {
				config:  function(cfg){config(module, cfg);},
				color:	 color,
				logger:	 function(type, arg){logger(module, type, arg);},
				time:	 function(name){time(module, name, true)},
				timeEnd: function(name){time(module, name, false)},
				param:   function(name, value){logger(module, ModuleList[module].deftype, [color('1;33', name+' ('+(typeof value)+')'), color('1;32', util.inspect(value))]);}
			};
			for (var key in ModuleList[module].type) {
				obj[key] = getTypeFunction(module, key);
			}
			return obj;
		};
	
		
		// ********** INIT **********
		me.init = function(){
			// test
			var console = me.console('Logger', {date: false, time:false, prefix:'     '});
			console.config({modulename:true, level: 0});
			
			console.info('Init');
			
			console.time('Time');
			console.trace('Test trace message.');
			console.debug('Test debug message.');
			console.info('Test info message.');
			console.warning('Test warning message.');
			console.error('Test error message.');
			console.fatal('Test fatal message.');
			console.param('Name', [123, {test:123}]);
			console.timeEnd('Time');
			
			console.config({prefix:""});
			console.info('TEST ERROR');

			try {
				requery('util');
			} catch(error) {
				error = new VError(error, 'Module.%s.%s > %s', conf.name, 'init', error.name);
				console.error(error.message);
			} 
			
		};
		
		// ********** END **********
		return me;
	};
	return {Required: Required, Module: Module};
})();