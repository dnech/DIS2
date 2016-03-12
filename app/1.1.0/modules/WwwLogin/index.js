/*  MODULE WWW Login Test */
module.exports = (function(){	
	var Required = ['Gate', 'Sessions', 'Direct', 'Libs'];
	var Module = function(conf){
		var me = conf;
		// ********** BEGIN **********
		
		var path = require('path');
		var VError = require('verror');
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
		// ********** PRIVATE **********
		var dir_private = path.resolve(me.path, 'private');
		var dir_public  = path.resolve(me.path, 'public');
		
		var base_url = '/test/';
		
		//Registre route
		App.Gate.regRoute('WWW Login Test: "'+base_url+'"', function(server, express){
					
			// Libs
			server.get(base_url+'lib/:ssid/:content', function(req, res) {
				App.Libs.Content(req.params.ssid, req.params.content, {}, {}, function(err, data){
					if (err) {return res.end();}
					res.end(data);
				});
			});	
			
			// Libs Template
			server.get(base_url+'cont/:ssid/:content', function(req, res) {
				App.Libs.Content(req.params.ssid, 'template', {dir: dir_private, page: req.params.content}, {}, function(err, data){
					if (err) {return res.end();}
					res.end(data);
				});
			});	
			
			// Direct
			App.Direct.regRoute(server, {
				namespace: 'App.Direct',
				base_url: base_url,
				ssid: function(req){return req.cookies['D-SSID'];},
				hook_api: function(script){
					script = 'App = window.App || {};\n'+script;
					return script;
				},
				//hook_rpc: fn(data, success)
			});
			
			// Любой запрос прошедший провеку на сессию
			server.use(base_url, express.static(dir_public));
			
		});
		
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
			console.config({prefix:""});
		};
			
		// ********** END **********
		return me;
	}
	return {Required:Required, Module:Module};
})();


		
		
			// Инициализация сессии
		//	server.get(base_url, function(req, res) {
		//		App.Sessions.routerInit(req, res, base_url+'login.html', base_url+'index.html');
		//	});
			
			// Проверка сессии для каждого запроса
		//	server.get(base_url+'*', function(req, res, next) {
		//		App.Sessions.routerCheck(req, res, next, base_url); 
		//	});
			
		//	App.Direct.regRoute('App.Direct', base_url, server, 'D-SSID', function(script){
		//		script = 'App = window.App || {};\n'+script;
		//		return script;
		//	});
		
		/*			
				App.Libs.TaDa(req.params.content, {ssid:req.params.ssid, right:['*'], sandbox:{console:console, require:function(data){console.log('Requred', data); return require(data);}}}, function(obj) {
					if (obj.success && (typeof obj.data == 'function')) {
						try {
							obj.data(function(obj){
								res.end(obj.data);
							});
						} catch(error) {
							res.end('Error '+error);
						}
					} else {
						console.log('server.get error', obj.data);
						res.end(obj.data);
					}
				});
				
				
			});
		*/