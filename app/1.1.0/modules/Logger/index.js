/*  MODULE LOGGER */	
module.exports = (function(){

	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		
		var ModuleList = {};
		
		function logger(type, module, arg){
			if (ModuleList[module]){
				var args = [module+':'];
				for (var i = 0; i < arg.length; i++) {
					args.push(arg[i]);
				}
				switch (type) {
				  case 'info':
					args[0] = module+'.Info:';
					console.info.apply(this, args);
					break;
				  case 'error':
				    args[0] = module+'.Error:';
					console.error.apply(this, args);
					break;
				  default:
					console.log.apply(this, args);
				}
			}
		}
		
		me.set = function(module){
			ModuleList[module] = true;
			return {
				enable: function(on){
					ModuleList[module] = on;
				},
				log: function(){
					logger('log', module, arguments);
				},
				info: function(){
					logger('info', module, arguments);
				},
				error: function(){
					logger('error', module, arguments);
				},
			}
		};
	
		
		/*
			console.error([data][, ...])
			console.info([data][, ...])
			console.log([data][, ...])
			console.time(label)
			console.timeEnd(label)
		*/
		
		/* Init module */
		me.init = function(){
			//test
			var test1 = me.set('Module1');
			var test2 = me.set('Module2');
			
			test1.log('Info1', 123);
			test1.info('Info1', 123);
			test1.error('Info1', 123);
			
			test2.log('Info2', 123);
			test1.info('Info2', 123);
			test1.error('Info2', 123);
			
			test1.enable(false);
			test1.log('Info1', 456);
			test2.log('Info2', 456);
			
			test1.enable(true);
			test2.enable(false);
			test1.log('Info1', 789);
			test2.log('Info2', 789);

		};
		
		return me;
	};
	
	return {
		Required: [],	
		Module: Module
	}
})();