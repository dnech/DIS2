var path = require('path');
App.utils  = require('./common/utils');

module.exports = function(schema){
	try {
			App.namespace('App.core');
			App.core = App.utils.loadConfig(App.path.core);			
			log.param('App.core',    App.core);
			// Load modules and plugins
			require(path.resolve(App.path.core, './common/module'))();
		
	} catch (err) {
		log.error('Init core "'+schema.use_core+'"', err);
		return;
	}
}

/*
// Modules load
function modulesLoad(mods, folder, required) {
	try {
		var Modules = App.namespace('Modules'); 
		for (var idx in mods) {
			var module = mods[idx];
			//log.info('    Info "'+module+'"');
			if (typeof Modules[module] === 'undefined') {
				if (!required){
					log.title('  Load "'+module+'"');
				} else {
					log.title('    Load required "'+module+'"');
				}
				var mod_folder = path.resolve(folder, module);
				Modules[module] = require(mod_folder);
				modulesLoad(Modules[module].Required, folder, true);
				Modules[module].Compile = Modules[module].Module({name: module, path: mod_folder, config: App.utils.extend(true, {}, App.Core.config.settings[module], App.Core.schema.settings[module])});
			} else {
				if (!required){
					log.title('  Load "'+module+'", already loaded.');
				} else {
					log.title('    Load required "'+module+'", already loaded.');
				}
			}
		}
	} catch (err) {
		log.error('Load modules', err);
		return undefined;
	}
}

// Modules init
function modulesInit() {
	log.info(log.color('1;35', 'Initialization modules...'));
	try {
		for (var idx in App.Modules) {
			var module = App.Modules[idx].Compile;
			if (typeof module.init === 'function') {
				log.title('  Initialization "'+module.name+'"');
				module.init();
			}
		}
	} catch (err) {
		log.error('Initialization module', err);
		return undefined;
	}
}

module.exports = (function(){	
	var initCore = function(schema){
		var Core = App.namespace('Core'); 
		try {
			// Load config
			Core.schema = schema;
			Core.config = require('./config.json');
			
			log.info(log.color('1;35', 'Load core "'+Core.config.version+'"'));
			log.param('  Use schema:', schema.path);
			log.param('  Use schema name:', schema.name);
			
			// Load modules
			log.info(log.color('1;35', 'Load modules...'));
			try {
				modulesLoad(require('./modules/list.json').list, __dirname+'/modules');
			} catch (err) {
				log.error('Load modules', err);
			}
			
			// Load plugins
			log.info(log.color('1;35', 'Load plugins...'));
			try {
				modulesLoad(require('./plugins/list.json').list, __dirname+'/plugins');
			} catch (err) {
				log.error('Load plugins', err);
			}
			
			// Init all modules
			modulesInit();
	
			log.info(log.color('1;35','Core started!'));
		} catch (err) {
			log.error('Init core', err);
			return undefined;
		}
		
		return Core;
	}
	return initCore;
})();
*/