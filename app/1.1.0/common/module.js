var fs    = require('fs');
var path  = require('path');

function exists(file){
    try {return fs.statSync(file).isFile();} catch (err) {return false;}
}

function errorParse(err) {
  var stack = '';
  if (err.stack) {
    stack = (err.stack.split('\n'))[1];
    stack = (/\(([^()]*)\)/.exec(stack))[1];
  }
  var name = err;
  if (err.name) {
    name = err.name;
  }
  var message = '';
  if (err.message) {
    message = err.message;
  }
  return name+': '+message+' {'+stack+'}';  
}

// Modules load
function modulesLoad(type, mods, folder, required) {
	try {
		var Modules = App.namespace('modules'); 
		for (var idx in mods) {
			var module = mods[idx];
			if (typeof Modules[module] === 'undefined') {
				if (!required){
					log.title('  Load "'+module+'"');
				} else {
					log.title('    Load required "'+module+'"');
				}
				var mod_folder = path.resolve(folder, './'+module);
				var config = App.utils.loadConfig(mod_folder);
				var config_schema = App.utils.loadConfig(path.resolve(App.path.schema, './'+module));
				App.utils.extend(true, config, config_schema);
				try {
				  Modules[module] = require(mod_folder);
				} catch (err) {
          log.error('Module require "'+module+'"', errorParse(err));
        }
        modulesLoad(type, Modules[module].Required, folder, true);
				Modules[module].Config  = {name: module, path: mod_folder, type: type, config: config};
				try {
          Modules[module].Compile = Modules[module].Module(Modules[module].Config);
        } catch (err) {
          log.error('Compile modules "'+module+'"', errorParse(err));
        }
        App.Events.emit('load', module);
			} else {
				if (!required){log.title('  Load "'+module+'", already loaded.');} else {log.title('    Load required "'+module+'", already loaded.');}
			}
		}
	} catch (err) {
		log.error('Load modules', errorParse(err));
	}
}

// Modules init
function modulesInit() {
	log.info(log.color('1;35', 'Initialization modules...'));
	try {
		for (var idx in App.modules) {
			var module = App.modules[idx].Compile;
			if (typeof module.init === 'function') {
				log.title('  Initialization "'+module.name+'"');
				module.init();
                App.Events.emit('init', module.name);
			}
		}
        log.info(log.color('1;35', 'Core initialized'));
        App.Events.emit('initialized');
	} catch (err) {
		log.error('Initialization module', errorParse(err));
	}
}

function modulesFind(dir) {
	var list = [];
	var ls = fs.readdirSync(dir);
	ls.forEach(function(el, i){
		var stat = fs.statSync(path.join(dir, ls[i]));
		if (stat && stat.isDirectory()) {
			list.push(ls[i]);
		}
	});
	return list;
}

module.exports = function(){
	try {
		log.info(log.color('1;35', 'Load modules...'));
		var list = require(path.resolve(App.path.modules, './list.json')).list;
		log.param('list', list);
		modulesLoad('module', list, App.path.modules);
	} catch(err) {
		log.error('Core init module', err);
		return;
	}
	try {
		log.info(log.color('1;35', 'Load plugins...'));
		var list = modulesFind(App.path.plugins); //require(path.resolve(App.path.plugins, './list.json')).list;
		log.param('list', list);
		modulesLoad('plugin', list, App.path.plugins);
	} catch(err) {
		log.error('Core init plugin', err);
		return;
	}
    App.Events.emit('loaded');
	modulesInit();
    App.Events.emit('launched');
}