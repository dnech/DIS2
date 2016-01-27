/*  MODULE WWW Login Test */
var path = require('path');

module.exports = (function(){	
	var Required = ['Gate', 'Sessions', 'Direct', 'Libs'];
	var Module = function(conf){
		var me = conf;
		
		var dir = path.resolve(me.path, me.config.dir);
		
		var base_url = '/test/';
		
		//Registre route
		App.Gate.regRoute('WWW Login Test: "'+base_url+'"', function(server, express){
		
		
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
			
			
			// Libs
			server.get(base_url+'lib/:ssid/:content', function(req, res) {
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
		
			// Use Direct
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
			server.use(base_url, express.static(dir));
			
		});
		
		me.init = function(){
			log.param('    Server WWW Login Test folder:', dir);
		};
		
		return me;
	}
	return {Required:Required, Module:Module};
})();