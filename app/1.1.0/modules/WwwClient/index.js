/*  MODULE WWW Client */
var path = require('path');

module.exports = (function(){
	var Required = ['Gate'];	
	var Module = function(conf){
		var me = conf;
		
		var dir = path.resolve(me.path, me.config.dir);
		
		//Registre route
		App.Gate.regRoute('WWW Client: "/client/"', function(server, express){
			if (typeof Express !== 'undefined') { /* INTEGRATE MODE */
				server.use('/client/', express.static(dir));
			} else { /* MAIN MODE */
				server.use(express.static(dir));
			}
		});
		
		me.init = function(){
			log.param('    Server WWW Client folder:', dir);
		};
		
		return me;
	}
	return {Required:Required, Module:Module};
})();