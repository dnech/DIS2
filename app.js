/**
* @name DIS2
* @namespace
* @desc This is the principal namespace of my Application, all the core 
* modules, and methods are here
*/

// Application
/**
* @desc RunApplication
* 
* @fires SystemReady
* @fires MyCoreApp.SystemReady
* @fires document.SystemReady
*/
function RunApplication(schema){
	//// Compressor
	//var pack = require('./app/common/packer').pack;
	//// Compress Core
	//var comp = pack('./app/0.1.0/index.core', __dirname+'\\sources\\cores\\0.1.0', true);
	//comp.add(__dirname+'/sources/cores/0.1.0');//, [__dirname+'/cores/v1/node_modules', __dirname+'/cores/v1/plugins']);
	//comp.save();	
	//// Compress Schema
	//var comp = pack('./schemas/test.schema', __dirname+'\\sources\\schemas\\test', true);
	//comp.add(__dirname+'/sources/schemas/karavan');
	//comp.save();
	
	var path     = require('path');
	var basepath = path.dirname(process.mainModule.filename);
	require('./app/loader')(basepath, path.resolve(basepath, './schemas/'+schema));
}


RunApplication('karavan');