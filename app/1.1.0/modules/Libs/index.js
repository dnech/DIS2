/** 
 * MODULE LIB 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
"use strict";
module.exports = (function(){
	var Required = ['Logger', 'Storage', 'Access', 'Direct'];
	var Module   = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********

		var vm = require('vm');
		var VError = require('verror');
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
		// ********** PRIVATE **********
		
		// Создание пространства переменных из строки для передачи в скрипт
		function compileSandbox(src, name, callback){
			try {
				console.trace('compileSandbox:1', typeof src, src);
				//var script  = new vm.Script("(function(){return function(){ return "+src+" ; };})();", { filename: 'Libs/'+name+'_sanbox' });
				//var data    = script.runInThisContext();		
				data = eval('new Object('+src+')');
				return callback(null, data);
			} catch(error) {
				error = new VError(error, 'Module.%s.%s > %s', conf.name, 'compileSandbox("'+name+'")', error.name);
				console.trace('compileSandbox:3', typeof error, error);
				return callback(error);
			}
		};
		
		// Выполнение скрипта с возвратом результата через return
		function runScript(src, sandbox, name, callback){
			name = name || 'unknow';
			try {
				var script  = new vm.Script("(function(){return function(){ "+src+" };})();", { filename: 'Libs/'+name });
				var data    = script.runInContext(new vm.createContext(sandbox));
				return callback(null, data());
			} catch(error) {
				error = new VError(error, 'Module.%s.%s > %s', conf.name, 'runScript("'+name+'")', error.name);
				console.error('runScript', require('util').inspect(error.stack));
				return callback({error: error, module:conf.name, path:'runScript'});
			}
		};
		
		// ********** PUBLIC **********
		me.Box = App.Storage.Box(conf.name, {
			path: 'data',
			ext: '.lib'
		});
		
        
		me.content = function(ssid, name, config, sandbox, callback) {
			console.trace('me.content:1', name, config);
			me.Box.get(name, function(err, data) {
				console.trace('me.content:2', err, data);
				if (err) {return callback(err, data);}			
				
				// set file config on default
				data = App.utils.extend(true, {
					acl: '*',
					script: false,
					sandbox: {},
					src: ''
				}, data);
				console.trace('me.content:3', data);
				
				// Acl
				if (!App.Access.Check(ssid, data.acl)) {
					console.trace('me.content:4', 'Error: access denied!');
					return callback('Error: access denied!');
				}
				
				// Форматирование пространства
				compileSandbox(data.sandbox, name, function(err, compile_sandbox) {
					if (err) {return callback(err, compile_sandbox);}	
					sandbox = App.utils.extend(true, compile_sandbox, sandbox);
					if (!data.script) {
						console.trace('me.content:5', sandbox, data.src);
						var mod_src = data.src;
						for (var key in sandbox){
							console.trace('me.content:5+', key, typeof sandbox[key],  sandbox[key]);
							if (typeof sandbox[key] == 'string') {
								mod_src = mod_src.replace(new RegExp('{'+key+'}', 'g'), sandbox[key]);
							}
						}
						console.trace('me.content:6', mod_src);
						return callback(null, mod_src);
					} else {
						console.trace('me.content:7');
						sandbox.config = App.utils.extend(true, {}, sandbox.config, config); // config from client side
						runScript(data.src, sandbox, name, function(err, data){
							if (typeof data === 'function') {
								data(callback);
							} else {
								callback(err, data);
							}
						});
					}
				});
				
			});
		};	
			
			// Подготовка конфига для запуска скрипта
			
			/*
			{
				App: App,
				render: function(info) {
					console.log('Render', info);
				},
				text: function(info) {
					return info+')))';
				},
				name: name,
				console: console,
				require: require	
			}
			
			var src = 	" return function(callback){ "+
						"	render('SCRIPT'); "+
						"	var path = require('path'); "+
						"	var JUST = require('just'); "+
						"	var just = new JUST({ root : path.resolve(App.Libs.path, 'view'), useCache : true, ext : '.html' }); "+
						"	just.render(name, { title: text('Hello, World!') }, callback); "+
						" }; "; 
						
			runScript(src, config, name, function(err, data){
				if (typeof data === 'function') {
					data(callback);
				} else {
					callback(err, data);
				}
			});
			
			//Registre route
			App.Gate.regRoute('Libs, type:[raw, html, css, js], url: "'+me.config.url+'"', function(server){
				server.get(me.config.url, function(req, res) {
					var ssid = '0';
					//console.log('cookies', req.cookies);
					if ((typeof req.cookies !== 'undefined') && (typeof req.cookies[me.config.ssid] !== 'undefined')) {
						ssid = req.cookies[me.config.ssid];
						//console.log('SSID exist', ssid);
					}
					//console.log('Libs', ssid, req.params.type);
					res.end(ContentLib(ssid, req.params.type));
				});
			});
		*/
		
		// Direct for all 
		App.Direct.on({
		  Libs:{
		    _content: 'Info: Get Libs Content. Param: {name, config}. Return: Script run result.',
			  content: function(ssid, param, callback) {me.content(ssid, param.name, param.config, {}, callback);}
			}
		}, '*');
		
    // Direct for admin
		App.Direct.on({
			Libs: {
        Box: me.Box.Direct
      }  
		}, '#');
    
    
      // Register Acceess Resource
      App.Access.Resources.register(conf.name, {
        module: conf.name,
        name:   conf.name+'.*',
        title:  conf.name+'.*',
        description: 'Module: '+conf.name+'. Data: All.'
      });
        
      // Register Acceess Resource
      App.Access.Resources.register(conf.name, (cb) => {
        me.Box.list((err, list) => {
          if (err){return cb(null, []);}
            var module = conf.name;
            var files = [];
            for (var key in list) {
              files.push({module:module, name:module+'.'+key, title:module+'.'+key, description:'Module: '+module+'. Data: '+key+'.'});
            }
            cb(null, files);  
        });
		});
        
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
			console.config({prefix:""});
		};
			
		// ********** END **********
		return me;
	};
	return {Required: Required,	Module: Module};
})();