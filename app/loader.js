'use strict';
var path   = require('path');
var events = require('events');

global.unpack = require('./common/packer').unpack();
global.log    = require('./common/logger');

global.App = {};
App.path = {};

App.Events  = new events.EventEmitter();

/*   Namespace  */
App.namespace = function (ns_string, def_object) { 
	var parts = ns_string.split('.'), parent = App;	
	if (parts[0] === 'App') {parts = parts.slice(1);} 
	for (var i=0; i<parts.length; i++) { 
		if (typeof parent[parts[i]] === 'undefined') { 
			parent[parts[i]] = {};
			if (parts.length === i+1){
				parent[parts[i]] =(typeof def_object === 'object') ? def_object : {};
			}
		} 
		parent = parent[parts[i]]; 
	} 
	return parent; 
};

module.exports = function(basepath, schema){

	App.path.schema = path.resolve(schema);
	App.path.root   = path.resolve(basepath);
	App.path.app    = path.resolve(App.path.root, './app');
	
	App.schema = require(path.resolve(App.path.app, './common/schema'))(schema);
	log.param('App.schema', App.schema);
	require(path.resolve(App.path.app, './common/core'))(App.schema);
}

/*

var fs     = require('fs');
var path   = require('path');
var util   = require('util');

var unpacker = require('./unpacker');

function logSchemeInfo(Schema){
	Log.info(Log.color('1;35', 'Load scheme "'+Schema.query+'"'));
	Log.param('  Name:', Schema.name);
	Log.param('  Description:', Schema.description);
	Log.param('  Use core:', Schema.use_core);
}



module.exports = (function(){
	var Starter = function(schema){
		try {
			
			
			
			// Schema
			var Schema    = require(path.resolve(schema, 'config.json'));
			Schema.query  = schema; 
			Schema.path   = path.resolve(__dirname, schema);
			logSchemeInfo(Schema);
			
			// Core
			try {
				var core_path = path.resolve('./cores', Schema.use_core);
				var core_pack_path = path.resolve('./cores', Schema.use_core+'/'+Schema.use_core+'.core');
				if (fileExists(core_pack_path)) {
					Log.info(Log.color('1;35', 'PreLoad packed core "'+core_pack_path+'"'));
					var parse = path.parse(core_pack_path); 
					unpacker.addPack(core_pack_path, path.resolve(path.dirname(process.mainModule.filename), core_path));
				}
				require(core_path)(Schema);
			} catch (err) {
				Log.error('Init core', util.inspect(err));
			}
		} catch (err) {
			Log.error('Init schema', util.inspect(err));
		}
	}
	return Starter;
})();

*/