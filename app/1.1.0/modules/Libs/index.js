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
		
		function runScript(src, config, name, callback){
			name = name || 'unknow';
			try {
				var script  = new vm.Script("(function(){return function(){ "+src+" };})();", { filename: 'Libs/'+name });
				var data    = script.runInContext(new vm.createContext(config.sandbox));
				callback(null, data());
			} catch(error) {
				console.error('runScript', error);
				callback({error: error, module:conf.name, path:'runScript'});
			}
		};
		
		// ********** PUBLIC **********
		me.Box = App.Configs.Box(conf.name, {
			path: 'data',
			ext: '.lib'
		});
		
		me.Content = function(name, cfg, callback) {
			console.trace('me.Content', name, cfg);
			// Подготовка конфига для запуска скрипта
			var config = App.utils.extend(true, {
				ssid:'',
				rights_use: [],
				rights_including: [],
				rights_except: [],
				sandbox: {
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
			}, cfg);
			
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
		};
		
		/*
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
				Content: function(ssid, param, callback) {me.Content(param.name, param.config, callback);},
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