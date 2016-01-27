/*  MODULE TEST DIRECT */
module.exports = (function(){
	var Module = function(conf){
		var me = conf;
		
		/* ----------------------------------------------------------------------------- */
		var Counter = 0;

		// REGISTRED FUNCTION IN DIRECT
		
		App.Direct.On({
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
		
		log.param('    TEST DIRECT load:', '');
		/* ----------------------------------------------------------------------------- */
		
		me.init = function(){
			log.param('    TEST DIRECT init:', '');
		};
		
		return me;
	}
	return {Required:['Direct'], Module:Module};
})();