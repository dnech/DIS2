var fs    = require('fs');
var path  = require('path');
//var un    = require('./packer').unpack();

function exists(file){
    try {return fs.statSync(file).isFile();} catch (err) {return false;}
}

module.exports = function(schema){
	try {
		// Add absolute path
		App.path.core    = path.resolve(App.path.app,  './'+schema.use_core);
		App.path.modules = path.resolve(App.path.core, './modules');
		App.path.plugins = path.resolve(App.path.core, './plugins');
		
		log.info(log.color('1;35', 'Calculation paths...'));	
		log.param('App.path.schema', App.path.schema);
		log.param('App.path.root',   App.path.root);
		log.param('App.path.app',    App.path.app);
		log.param('App.path.core',    App.path.core);
		log.param('App.path.modules', App.path.modules);
		log.param('App.path.plugins', App.path.plugins);
		
		
		//var core_path = path.resolve('./', schema.use_core+'/core');
		
		var core_pack_path = path.resolve(App.path.core+'/index.core');
		if (exists(core_pack_path)) {
			log.info(log.color('1;35', 'PreLoad packed core "'+core_pack_path+'"'));
			var parse = path.parse(core_pack_path); 
			unpack.addPack(core_pack_path, App.path.core);
			log.info(log.color('1;35', 'core_pack_path '+core_pack_path+'.'));
			log.info(log.color('1;35', 'App.path.core '+App.path.core));
		}
		
		log.info(log.color('1;35', 'Load core '+schema.use_core+'...'));
		require(App.path.core)(schema);
		
	} catch (err) {
		log.error('Loader init core', err);
		return;
	}
}