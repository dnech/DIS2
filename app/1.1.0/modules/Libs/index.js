/*  MODULE LIB */
module.exports = (function(){
	var Required = ['Logger', 'Configs', 'Acl', 'Direct'];
	var Module   = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********

		var vm = require('vm');
		
		// Logger.console
		var console = App.Logger.console(conf.name, me.config.logger);
		console.info('Load...');
		
		// ********** PRIVATE **********
		
		function compileSandbox(src, name, callback){
			try {
				console.trace('compileSandbox:1', typeof src, src);
				//var script  = new vm.Script("(function(){return function(){ return "+src+" ; };})();", { filename: 'Libs/'+name+'_sanbox' });
				//var data     = script.runInThisContext();
				
				data = eval('new Object('+src+')');
				
				//console.trace('compileSandbox:2', typeof data, data);
				callback(null, data);
			} catch(error) {
				console.trace('compileSandbox:3', typeof error, error);
				callback(error);
			}
		};
		
		function runScript(src, sandbox, name, callback){
			name = name || 'unknow';
			try {
				var script  = new vm.Script("(function(){return function(){ "+src+" };})();", { filename: 'Libs/'+name });
				var data    = script.runInContext(new vm.createContext(sandbox));
				callback(null, data());
			} catch(error) {
				console.error('runScript', require('util').inspect(error.stack));
				callback({error: error, module:conf.name, path:'runScript'});
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
				
				// Content
				if (!data.script) {
					console.trace('me.Content:5');
					return callback(null, data.src);
				} else {
					// Форматирование пространство для выполнения скрипта
					console.trace('me.Content:6');
					compileSandbox(data.sandbox, name, function(err, compile_sandbox) {
						if (err) {return callback(err, compile_sandbox);}	
						sandbox = App.utils.extend(true, compile_sandbox, sandbox);
						console.trace('me.Content:7');
						sandbox.config = App.utils.extend(true, {}, sandbox.config, config); // config from client side
						console.trace('me.Content:8');
						runScript(data.src, sandbox, name, function(err, data){
							if (typeof data === 'function') {
								data(callback);
							} else {
								callback(err, data);
							}
						});
					});	
				}	
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