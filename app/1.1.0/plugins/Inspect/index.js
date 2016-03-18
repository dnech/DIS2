/*  MODULE INSPECT */

module.exports = (function(){
	var Required = [];
  var Module = function(conf){
		var me = conf;
		
    // Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
    
		me.init = function(){
			try {
				//Log.title("INSPECT");
				//Log.param("    CORE.Schema ",  App.Core.Schema);
				//Log.param("    CORE.Config ",  App.Core.Config);
				//Log.param("    CORE.Modules ", App.Core.Modules);
				//Log.param("    APP: ", APP);
				console.param("    App.Direct: ", App.Direct);
				//Log.param("    APP.Gate: ", APP.Gate);
			} catch (err) {
				console.error('Module "'+me.name+'"', err);
			}
		};
		
		return me;
	}
	return {Required:Required, Module:Module};
})();