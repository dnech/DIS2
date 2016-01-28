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
	
/*  MODULE LOGGER */	
module.exports = (function(){

	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		
		var ModuleList = {};
		
		// Color
		function color(cod, str, disable) {
			if (disable) {return str;}
			return '\033['+cod+'m'+str+'\033[0m';
		}
		
		// TimeStamp
		function timestamp() {
			var ts_ = new Date(),
				dy = ('0'+ts_.getDate()).substr(-2),			//	Set the day as a number (1-31)
				yy = ts_.getFullYear(),							//	Set the year (optionally month and day)
				hr = ('0'+ts_.getHours()).substr(-2),			//	Set the hour (0-23)
				ms = ('00'+ts_.getMilliseconds()).substr(-3),	//	Set the milliseconds (0-999)
				mi = ('0'+ts_.getMinutes()).substr(-2),			//	Set the minutes (0-59)
				mo = ('0'+(ts_.getMonth()+1)).substr(-2),		//	Set the month (0-11)
				sc = ('0'+ts_.getSeconds()).substr(-2),			//	Set the seconds (0-59)
				tm = ts_.getTime();								//	Set the time (milliseconds since January 1, 1970)	
			return '['+yy+'.'+mo+'.'+dy+' '+hr+':'+mi+':'+sc+'.'+ms+']';
		}
		
		// Logger
		function logger(type, module, arg){
			var config = ModuleList[module];
			if (config && config.enable){
				var param = config.type[type] || config.type['trace'],
					ts = (config.timestamp) ?  color('33', timestamp(), !config.color)+' ' : '',
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
		}
		
		me.console = function(module, cfg){
			ModuleList[module] = {
				enable:     true,
				timestamp:  true,
				modulename: true,
				prefix:     '',
				color:		true,
				level:      0,
				type: {
					'trace':   {level: 0, color:'1',  name: '[trace]'}, 
					'debug':   {level: 1, color:'1;36',  name: '[debug]'}, 
					'info':    {level: 2, color:'1;32',  name: '[info]'}, 
					'warning': {level: 3, color:'1;33',  name: '[warning]'},
					'error':   {level: 4, color:'1;31',  name: '[error]'},
					'fatal':   {level: 5, color:'1;31;41', name: '[fatal]'}
				}
			};
			
			function config(cfg){
				ModuleList[module] = App.utils.extend(true, {}, ModuleList[module], cfg);
			};
			
			if (typeof cfg == 'object') {config(cfg);}
			
			return {
				config:  config,
				color:	 color,
				logger:	 logger,
				log:	 function(){ logger('info',		module, arguments); },
				trace:	 function(){ logger('trace',	module, arguments); },
				debug:	 function(){ logger('debug',	module, arguments); },
				info:	 function(){ logger('info',		module, arguments); },
				warning: function(){ logger('warning',	module, arguments); },
				error:	 function(){ logger('error',	module, arguments); },
				fatal:	 function(){ logger('fatal',	module, arguments); },  
				time:	 function(name){time(module, name, true)},
				timeEnd: function(name){time(module, name, false)},
			}
		};
	
		
		/* Init module */
		me.init = function(){
			//test
			var test = me.console('Logger', {timestamp:true, prefix:'     '});
			test.config({modulename:true, level: 0});
			
			test.time('Time');
			test.trace('Test trace message.');
			test.debug('Test debug message.');
			test.info('Test info message.');
			test.warning('Test warning message.');
			test.error('Test error message.');
			test.fatal('Test fatal message.');
			test.timeEnd('Time');

		};
		
		return me;
	};
	
	return {
		Required: [],	
		Module: Module
	}
})();