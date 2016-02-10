/*  MODULE LIB */
module.exports = (function(){
	var Required = ['Logger', 'Configs', 'Acl', 'Direct'];
	var Module   = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********

		var vm = require('vm');
		var VError = require('verror');
		
		// Logger.console
		var console = App.Logger.console(conf.name, me.config.logger);
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
		me.Box = App.Configs.Box(conf.name, {
			path: 'data',
			ext: '.lib'
		});
		
		me.Content = function(ssid, name, config, sandbox, callback) {
			console.trace('me.Content:1', name, config);
			me.Box.Get(name, function(err, data) {
				console.trace('me.Content:2', err, data);
				if (err) {return callback(err, data);}			
				
				// set file config on default
				data = App.utils.extend(true, {
					acl: '*',
					script: false,
					sandbox: {},
					src: ''
				}, data);
				console.trace('me.Content:3', data);
				
				// Acl
				if (!App.Acl.Check(ssid, data.acl)) {
					console.trace('me.Content:4', 'Error: access denied!');
					return callback('Error: access denied!');
				}
				
				// Форматирование пространства
				compileSandbox(data.sandbox, name, function(err, compile_sandbox) {
					if (err) {return callback(err, compile_sandbox);}	
					sandbox = App.utils.extend(true, compile_sandbox, sandbox);
					if (!data.script) {
						console.trace('me.Content:5', sandbox, data.src);
						var mod_src = data.src;
						for (var key in sandbox){
							console.trace('me.Content:5+', key, typeof sandbox[key],  sandbox[key]);
							if (typeof sandbox[key] == 'string') {
								mod_src = mod_src.replace(new RegExp('{'+key+'}', 'g'), sandbox[key]);
							}
						}
						console.trace('me.Content:6', mod_src);
						return callback(null, mod_src);
					} else {
						console.trace('me.Content:7');
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
		
		// Direct for admin
		App.Direct.On({
			Libs: me.Box.Direct
		}, '#');
		
	
		// Direct for all 
		App.Direct.On({
			Libs:{
				_Content: 'Info: Get Libs Content. Param: {name, config}. Return: Script run result.',
				Content: function(ssid, param, callback) {me.Content(ssid, param.name, param.config, {}, callback);}
			}
		}, '*');
		
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