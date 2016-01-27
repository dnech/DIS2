/*  MODULE WWW Configurator */
var path = require('path');

module.exports = (function(){	
	var Module = function(conf){
		var me = conf;
		
		var dir = path.resolve(me.path, me.config.dir);
		
		//Registre route
		App.Gate.regRoute('WWW Configurator: "/cfg/"', function(server, express){
			server.use('/cfg/', express.static(dir));
		});
		
		me.init = function(){
			log.param('    Server WWW Configurator folder:', dir);
		};
		
		return me;
	}
	return {Required:['Gate'], Module:Module};
})();