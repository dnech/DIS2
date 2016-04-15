/** 
 * MODULE DIRECT 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
module.exports = (function(){
	var Required = ['Access', 'Logger'];
	var Module   = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
		// ********** PRIVATE **********
		// Массив регистрируемых Функций
		var DirectFunctions = {};
		
		// Список ошибок
		var ErrorList = {
			'E001': 'Function not found',
			'E002': 'Bad params',
			'E003': 'Unknow function error',
			'E004': 'Function error',
			'E005': 'Access denied',
			'E006': 'Bad request type, must be POST.'
		};
		
		var errSting = function(err){
			//console.trace('errSting', err);
			return require('util').inspect(err);
      //return err;
		};
		
		var SendOk = function(name, param, ans){
			if (typeof ans === 'object') {ans = JSON.stringify(ans);}
			return JSON.stringify({success: true, query:{cmd: name, param:param}, result:ans});
		};
		
		var SendError = function(cod, error, name, param){
			return JSON.stringify({success: false, cod:cod, error:error, msg:ErrorList[cod], query:{cmd: name, param:param}});
		};
	
		// Поиск функции по строковому пути
		var FindFn = function(namespace, name){
			if (name.indexOf(namespace)===0){
				name = name.substring(namespace.length+1);
			}
			var parts = name.split('.'), parent = DirectFunctions;
			try {
				for (var i=0; i<parts.length; i++) {  
					parent = parent[parts[i]]; 
				} 
				return parent; 
			} catch (err) {
				return undefined;
			}	
		};
	
		// Выполнить запрошенную функцию
		var DirectRun = function(ssid, query, req, res, hook_fn){
			var fnobj = FindFn(query.namespace, query.name);
			if (typeof fnobj === 'object' && typeof fnobj.fn === 'function') {
				
				// Проверка прав доступа
				if (!App.Access.check(ssid, fnobj.acl)) {
					res.end(SendError('E005', err, query.name));
					return;
				}
				
				// Получаем параметры
				var param;
				try {	
					if (typeof query.param !== 'undefined') {
						param = JSON.parse('{"data":'+query.param+'}').data;
					}
				} catch(err) {
					res.end(SendError('E002', errSting(err), query.name, query.param));
					return;
				}	
				
				// Выполняем функцию
				try {			
					fnobj.fn(
						ssid,
						param, 
						function(err, data){
							if (typeof hook_fn == 'function') {
								var modify = hook_fn(err, data);
								err  = modify.err;
								data = modify.data;
							}
							if (err) { // ERROR 
								console.error(err);
                res.end(SendError('E004', errSting(err), query.name, query.param));
							} else { // OK
								res.end(SendOk(query.name, query.param, JSON.stringify(data)));
							}
						}
						/*function(data){ // OK
							if (typeof hook_fn == 'function') {data = hook_fn(data, true);}
							res.end(SendOk(query.name, query.param, JSON.stringify(data)));
						},
						function(err){ // ERROR 
							if (typeof hook_fn == 'function') {err = hook_fn(err, false);}
							res.end(SendError('E004', err, query.name, query.param));
						}
						*/
					);
				} catch(err) {
					console.error('DirectRun', err);
					res.end(SendError('E003', errSting(err), query.name, query.param));
				}	
				
			} else {
				res.send(SendError('E001', '', query.name, query.param));
			}		
		};

		// Добавить новую функцию к списку функций	
		function addFunctions(target, source, acl, info) {
			if (typeof source == 'object') {
				if (typeof target != 'object') {target = {};}
				for (name in source) {
					// Объекты начинающиеся с "_" пропускаем, это описание одноименной функции 
					if (name.charAt(0) != '_') {
						target[name] = addFunctions(target[name], source[name], acl, (source['_'+name] || ''));
					}
				}
			} else if (typeof source == 'function') {
				target = {acl: acl, fn: source, info:(info || '')};
			}
			return target;
		};
	
	
		// ************* PUBLIC *************
		
		// Просмотр списка зарегистрированных функций
		me.list = function(param){
			return require('util').inspect(DirectFunctions, param);
		};
		
		// Регистрация функций
		me.on = function(){
			var a = arguments;
			/*
				arguments.length:
				1.  on(functions);  - одна функция или объект с функциями
				2.  on(functions, acl); - одна функция или объект с функциями, массив прав 
				2.  on(name, functions); - пространство имен, одна функция или объект с функциями
				3.  on(name, functions, acl); - пространство имен, одна функция или объект с функциями, массив прав
			*/
			switch (a.length) {
				case 1:
					addFunctions(DirectFunctions, a[0], App.Access.defAcl());
					return true;
				case 2:
					if (typeof a[0] === 'string') { 
						DirectFunctions[a[0]] = addFunctions(DirectFunctions[a[0]], a[1], App.Access.defAcl());
						return true;
					} else {
						addFunctions(DirectFunctions, a[0], App.Access.defAcl(a[1]));
						return true;
					}
				case 3:
					DirectFunctions[a[0]] = addFunctions(DirectFunctions[a[0]], a[1], App.Access.defAcl(a[2]));
					return true;		
			}
			return false;
		};
		
		// Удаление функции
		me.off = function(path) {
			var parts = path.split('.'),
			    parent = DirectFunctions;
			try {
				for (var i=0; i<parts.length; i++) { 
					parent = parent[parts[i]];
				}	 
				if (typeof parent !== 'undefined') {
					eval('delete DirectFunctions.'+path+';');
					return true; 
				}
			} catch(err) {}
			return false; 
		};
		
		
		// Сформировать строковый эквивалент функции для взаимодействия с Direct Api на стороне клиента
		me.getFunctionJs = function(ns, path, name, info, not_object){
			var _ns = (typeof ns !== 'undefined') ? ns : me.config.namespace;
			var _path = (typeof ns !== 'undefined') ? path : me.config.namespace+'.'+path;
			info = (typeof info == 'string') ? info : '';
			var fn_str = 'function(p,c){if(p==\'?\'){c(null,\''+info+'\'); return true;};'+_ns+'Api.send(\''+_path+'.'+name+'\',p,c); return true;}';
			if (not_object) {
				return name+' = '+fn_str+';\n';
			} else {
				return name+': '+fn_str+',\n';
			}
		};
		
		// Сформировать строковый эквивалент класса DirectApi и список функции для взаимодействия с Direct Api на стороне клиента
		me.getFunctionsJs = function(NameSpace, base_url, ssid) {
			ssid = ssid || '00000000-0000-0000-0000-000000000000';
			var fnlist = '';
			function parse(obj, path, tabs){
        var sorted = Object.keys(obj).sort();
        sorted.forEach((name)=>{
        //for (name in obj){
					if (name === 'AdminArea') {
            if (!App.Access.check(ssid, '#')) {
              return;
            }
          }
          if (typeof obj[name] === 'object' && typeof obj[name].fn === 'function') {
						// Проверка прав доступа
						if (App.Access.check(ssid, obj[name].acl)) {
							fnlist += tabs+me.getFunctionJs(NameSpace, path, name, obj[name].info);
						}
					} else if (typeof obj[name] === 'object') {
						fnlist += tabs+name+':{\n';
						parse(obj[name], path+'.'+name, tabs+'  ');
						fnlist += tabs+'},\n';
					}
				}
        );         
			}
			parse(DirectFunctions, NameSpace, '  ');
					
			/* ==================================================================== */
			var ret = ''+
				NameSpace+'Api = {\n'+
				' trace: '+me.config.trace+',\n'+
				' ssid: "'+ssid+'",\n'+
				' send: function(n, p, cb){\n'+
				'	if ('+NameSpace+'Api.trace) {console.time(n);};\n'+
				'	p = JSON.stringify(p);\n'+
				'	var url=location.protocol+"//"+location.host+"'+base_url+me.config.direct_url+'";\n'+
				'/* jQuery Ajax */\n'+
        '	$.ajax({\n'+
				'	  method: "POST",\n'+
				'	  url: url,\n'+
				'	  data: {ssid:'+NameSpace+'Api.ssid, data:{name: n, param: p}}\n'+
				'	})\n'+
				'	  .done(function(msg) {\n'+
				'		try {\n'+
				'			var a = JSON.parse(\'{"data":\'+msg+\'}\').data;\n'+
				'			if (a.success) {\n'+
				'				var tRes = a.result;\n'+
				'				if (typeof tRes !== \'undefined\') {\n'+
				'					tRes = JSON.parse(\'{"data":\'+tRes+\'}\').data;\n'+
				'				}\n'+
				'				if ('+NameSpace+'Api.trace) {console.timeEnd(n);};\n'+
				'				if (typeof cb === \'function\') {cb(null, tRes);}\n'+
				'			} else {\n'+
				'				if ('+NameSpace+'Api.trace) {console.timeEnd(n);};\n'+
				'				if (typeof cb === \'function\') {cb(a);}\n'+
				'			}\n'+
				'		} catch(e) {\n'+
				'			console.error(\'Unknow\', e);\n'+
				'			if (typeof cb === \'function\') {cb(e);}\n'+
				'		}\n'+
				'	});\n'+
				'}};\n'+
				'\n'+
				NameSpace+' = {\n'+
				fnlist+
				'};\n';
			/* ==================================================================== */
			return ret;
		}
		
		// Helper for other module
		// Функция - помощник, для других модулей, регистрирует веб путь для получения js клиентского кода DirectApi
		me.regRouteApi = function(server, cfg){
			var config = App.utils.extend(true, {
				namespace: me.config.namespace,
				base_url: '',
				ssid: '', // string or function(req){return ssid;}
				//hook_api: fn(script),
				//hook_rpc: fn(err, data)
			}, cfg);
			console.log('me.regRouteApi', cfg, config);
			server.all(config.base_url+me.config.api_url, function(req, res) {
				var ssid = (typeof config.ssid == 'function') ? config.ssid(req) : config.ssid || '';
				var script = me.getFunctionsJs(config.namespace, config.base_url, ssid);
				if (typeof config.hook_api === 'function'){script = config.hook_api(script);}
				res.send(script);
			});
		};
		
		// Функция - помощник, для других модулей, регистрирует веб путь для работы DirectRpc
		me.regRouteRpc = function(server, cfg){
			var config = App.utils.extend(true, {
				namespace: me.config.namespace,
				base_url: '',
				//ssid: '', not used
				//hook_api: fn(script),
				//hook_rpc: fn(err, data) return {err, data}
			}, cfg);
			console.log('me.regRouteRpc', cfg, config);
			server.post(config.base_url+me.config.direct_url, function(req, res) {
				var params = req.body; //POST
				DirectRun(params.ssid, {namespace: config.namespace, name: params.data.name, param: params.data.param}, req, res, config.hook_rpc);
			});
			server.all(config.base_url+me.config.direct_url, function(req, res) {
				res.end(SendError('E006', err));
			});
		};
		
		// Функция - помощник, для других модулей, регистрирует как веб путь для получения js клиентского кода DirectApi так и веб путь для работы DirectRpc
		me.regRoute = function(server, cfg){	
			me.regRouteApi(server, cfg);
			me.regRouteRpc(server, cfg);
		};
		
		// Тестовая регистрация функции
		me.on({
			_Ping: 'Info: Test function Ping. Param: (any). Return: type and value input param',
			Ping: function(auth, param, callback) {
				callback(null, 'Pong "'+param+'" ('+(typeof param)+')');	
			}
		},
		'*');
			
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
			console.param('DirectFunctions', DirectFunctions);
		};
		
		// ********** END **********
		return me;
	};
	return {Required: Required, Module: Module}
})();


//Registre route
/* Gate api */
/*
	App.Gate.regRoute('Direct, api: "'+me.config.api_url+'", rpc: "'+me.config.direct_url+'"', function(server){
		//me.regRoute(me.config.namespace, '', server, function(req){return req.cookies['SSID'];});
		me.regRoute(server, {
		namespace: me.config.namespace,
		base_url: '',
		ssid: function(req){return req.cookies['SSID'];},
		//hook_api: fn(script),
		//hook_rpc: fn(err, data) return {err, data}
	});
});
*/