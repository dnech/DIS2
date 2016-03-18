/*  MODULE TEST DIRECT */
module.exports = (function(){
	var Required = ['Direct'];
  var Module = function(conf){
		var me = conf;
		
    // Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
    
		/* ----------------------------------------------------------------------------- */
		var Counter = 0;

		// REGISTRED FUNCTION IN DIRECT
		
		App.Direct.on({
			TestDirect:{
				Test1: function(ssid, param, ok, err){
					//log.error('*******************************','*');
					//log.error('CheckType param> ', param);
					//log.error('CheckType type> ', typeof param);
					ok(param);
				},
				Test2: function(ssid, param, ok, err){
					//log.error('TEST DIRECT > Test2', '');
					Counter++
					ok('ok2!!! '+Counter);
				},
				Test3: function(ssid, param, ok, err){
					//log.error('TEST DIRECT > Test3', '');
					Counter++
					ok('ok3!!! '+Counter);
				}
			}
		});
		
		console.param('TEST DIRECT load:', '');
		/* ----------------------------------------------------------------------------- */
		
		me.init = function(){
			console.param('TEST DIRECT init:', '');
		};
		
		return me;
	}
	return {Required:Required, Module:Module};
})();