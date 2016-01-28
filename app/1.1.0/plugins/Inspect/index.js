/*  MODULE INSPECT */

module.exports = (function(){
	var Module = function(conf){
		var me = conf;
		
		me.init = function(){
			try {
				//Log.title("INSPECT");
				//Log.param("    CORE.Schema ",  App.Core.Schema);
				//Log.param("    CORE.Config ",  App.Core.Config);
				//Log.param("    CORE.Modules ", App.Core.Modules);
				//Log.param("    APP: ", APP);
				log.param("    App.Direct: ", App.Direct);
				//Log.param("    APP.Gate: ", APP.Gate);
			} catch (err) {
				log.error('Module "'+me.name+'"', err);
			}
		};
		
		return me;
	}
	return {Required:[], Module:Module};
})();