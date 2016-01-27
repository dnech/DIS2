var fs    = require('fs');
var path  = require('path');
//var un    = require('./packer').unpack();

function exists(file){
    try {return fs.statSync(file).isFile();} catch (err) {return false;}
}

module.exports = function(schema){
	try {

		
		// Schema unpack
		if (exists(schema+'.schema')) {
			log.info(log.color('1;35', 'PreLoad packed scheme "'+schema+'.schema"'));
			var parse = path.parse(schema); 
			unpack.addPack(schema+'.schema', path.resolve(path.dirname(process.mainModule.filename), schema));
		}
		
		log.info(log.color('1;35', 'Load schemas...'));
		return require(path.resolve(App.path.schema, 'config.json'));
	} catch(err) {
		log.error('Loader init schema "'+schema+'"', err);
		return;
	}
}