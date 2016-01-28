/*  MODULE DIRECT */

module.exports = (function(){
	/* Массив регистрируемых Функций */
	var DirectFunctions = {};
	
	var ErrorList = {
		'E001': 'Function not found',
		'E002': 'Bad params',
		'E003': 'Unknow function error',
		'E004': 'Function error',
		'E005': 'Access denied',
		'E006': 'Bad request type, must be POST.'
	};
	
	var SendOk = function(name, param, ans){
		if (typeof ans === 'object') {ans = JSON.stringify(ans);}
		return JSON.stringify({success: true, query:{cmd: name, param:param}, result:ans});
	}
	
	var SendError = function(cod, error, name, param){
		return JSON.stringify({success: false, cod:cod, error:error, msg:ErrorList[cod], query:{cmd: name, param:param}});
	}
	
	/* Поиск функции по строковому пути */
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
	
	/* Выполнить запрошенную функцию */
	var DirectRun = function(ssid, query, req, res, hook_fn){
		var fnobj = FindFn(query.namespace, query.name);
		if (typeof fnobj === 'object' && typeof fnobj.fn === 'function') {
			
			/* Проверка прав доступа */
			if (!App.Acl.Check(ssid, fnobj.acl)) {
				res.end(SendError('E005', err, query.name));
				return;
			}
			
			/* Получаем параметры */
			var param;
			try {	
				if (typeof query.param !== 'undefined') {
					param = JSON.parse('{"data":'+query.param+'}').data;
				}
			} catch(err) {
				res.end(SendError('E002', err, query.name, query.param));
				return;
			}	
			
			/* Выполняем функцию */
			try {			
				fnobj.fn(
					ssid,
					param, 
					function(data){ /* OK */
						if (typeof hook_fn == 'function') {data = hook_fn(data, true);}
						res.end(SendOk(query.name, query.param, JSON.stringify(data)));
					},
					function(err){ /* ERROR */
						if (typeof hook_fn == 'function') {err = hook_fn(err, false);}
						res.end(SendError('E004', err, query.name, query.param));
					}
				);
			} catch(err) {
				res.end(SendError('E003', err, query.name, query.param));
			}	
			
		} else {
			res.send(SendError('E001', '', query.name, query.param));
		}		
	};
	
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
			
		function addFunctions(target, source, acl) {
			if (typeof source === 'object') {
				if (typeof target !== 'object') {target = {};}
				for (name in source) {
					target[name] = addFunctions(target[name], source[name], acl);
				}
			} else if (typeof source === 'function') {
				target = {acl: acl, fn: source};
			}
			return target;
		};
	
		me.List = function(param){
			return require('util').inspect(DirectFunctions, param);
		};
		
		me.On = function(){
			var a = arguments;
			/*
				arguments.length:
				1.  on(functions);
				2.  on(functions, acl);
				2.  on(name, functions);
				3.  on(name, functions, acl);
			*/
			switch (a.length) {
				case 1:
					addFunctions(DirectFunctions, a[0], App.Acl.Default());
					return true;
				case 2:
					if (typeof a[0] === 'string') { 
						DirectFunctions[a[0]] = addFunctions(DirectFunctions[a[0]], a[1], App.Acl.Default());
						return true;
					} else {
						addFunctions(DirectFunctions, a[0], App.Acl.Declare(a[1]));
						return true;
					}
				case 3:
					DirectFunctions[a[0]] = addFunctions(DirectFunctions[a[0]], a[1], App.Acl.Declare(a[2]));
					return true;		
			}
			return false;
		};
		
		me.Off = function(path) {
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
		
		/* test object */
		me.On('Ping',
			function(auth, param, ok, err) {
				ok('Pong "'+param+'" ('+(typeof param)+')');	
			},
		'*');
		
		
		me.GetFunctionJs = function(ns, path, name, not_object){
			var _ns = (typeof ns !== 'undefined') ? ns : me.config.namespace;
			var _path = (typeof ns !== 'undefined') ? path : me.config.namespace+'.'+path;
			if (not_object) {
				return name+' = function(param, ok, err){'+_ns+'Api.send(\''+_path+'.'+name+'\', param, ok, err);};\n';
			} else {
				return name+': function(param, ok, err){'+_ns+'Api.send(\''+_path+'.'+name+'\', param, ok, err);},\n';
			}
		};
		
		me.GetFunctionsJs = function(NameSpace, base_url, ssid) {
			ssid = ssid || '00000000-0000-0000-0000-000000000000';
			var fnlist = '';
			function parse(obj, path, tabs){
				for (name in obj){
					if (typeof obj[name] === 'object' && typeof obj[name].fn === 'function') {
						fnlist += tabs+me.GetFunctionJs(NameSpace, path, name);
					} else if (typeof obj[name] === 'object') {
						fnlist += tabs+name+':{\n';
						parse(obj[name], path+'.'+name, tabs+'  ');
						fnlist += tabs+'},\n';
					}
				}	
			}
			parse(DirectFunctions, NameSpace, '  ');
					
			/* ==================================================================== */
			var ret = '';
			ret += NameSpace+'Api = {\n';
			ret += ' trace: '+me.config.trace+',\n';
			ret += ' ssid: "'+ssid+'",\n';
			ret += ' send: function(name, param, ok, err){\n';
			ret += '	if ('+NameSpace+'Api.trace) {console.time(name);};\n';
			ret += '	param = JSON.stringify(param);\n';
			ret += '	var url=location.protocol+"//"+location.host+"'+base_url+me.config.direct_url+'";\n';
			ret += '	$.ajax({\n';
			ret += '	  method: "POST",\n';
			ret += '	  url: url,\n';
			ret += '	  data: {ssid:'+NameSpace+'Api.ssid, data:{name: name, param: param}}\n';
			ret += '	})\n';
			ret += '	  .done(function(msg) {\n';
			ret += '		try {\n';
			ret += '			var tAnswer = JSON.parse(\'{"data":\'+msg+\'}\').data;\n';
			ret += '			if (tAnswer.success) {\n';
			ret += '				var tRes = tAnswer.result;\n';
			ret += '				if (typeof tRes !== \'undefined\') {\n';
			ret += '					tRes = JSON.parse(\'{"data":\'+tRes+\'}\').data;\n';
			ret += '				}\n';
			ret += '				if ('+NameSpace+'Api.trace) {console.timeEnd(name);};\n';
			ret += '				if (typeof ok === \'function\') {ok(tRes);}\n';
			ret += '			} else {\n';
			ret += '				if ('+NameSpace+'Api.trace) {console.timeEnd(name);};\n';
			ret += '				if (typeof err === \'function\') {err(tAnswer);}\n';
			ret += '			}\n';
			ret += '		} catch(error) {\n';
			ret += '			console.error(\'Unknow\', error);\n';
			ret += '			if (typeof err === \'function\') {err(error);}\n';
			ret += '		}\n';
			ret += '	});\n';
			ret += '}};\n';
			ret += '\n';
			ret += NameSpace+' = {\n';
			ret += fnlist
			ret += '};\n';
			/* ==================================================================== */
			return ret;
		}
		
		// Helper for other module
		me.regRouteApi = function(server, cfg){
			var config = App.utils.extend(true, {
				namespace: me.config.namespace,
				base_url: '',
				ssid: '', // string or function(req){return ssid;}
				//hook_api: fn(script),
				//hook_rpc: fn(data, success)
			}, cfg);
			console.log('me.regRouteApi', cfg, config);
			server.all(config.base_url+me.config.api_url, function(req, res) {
				var ssid = (typeof config.ssid == 'function') ? config.ssid(req) : config.ssid || '';
				var script = me.GetFunctionsJs(config.namespace, config.base_url, ssid);
				if (typeof config.hook_api === 'function'){script = config.hook_api(script);}
				res.send(script);
			});
		};
		
		me.regRouteRpc = function(server, cfg){
			var config = App.utils.extend(true, {
				namespace: me.config.namespace,
				base_url: '',
				//ssid: '', not used
				//hook_api: fn(script),
				//hook_rpc: fn(data, success)
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
		
		me.regRoute = function(server, cfg){	
			me.regRouteApi(server, cfg);
			me.regRouteRpc(server, cfg);
		};
		
		//Registre route
		/* Gate api */
		App.Gate.regRoute('Direct, api: "'+me.config.api_url+'", rpc: "'+me.config.direct_url+'"', function(server){
			//me.regRoute(me.config.namespace, '', server, function(req){return req.cookies['SSID'];});
			me.regRoute(server, {
				namespace: me.config.namespace,
				base_url: '',
				ssid: function(req){return req.cookies['SSID'];},
				//hook_api: fn(script),
				//hook_rpc: fn(data, success)
			});
		});
		
		
		/* Init module */
		me.init = function(){
			log.param('    DirectFunctions:', DirectFunctions);
			console.log(me.List({ colors: true, showHidden: false, depth: null }));
		};
		
		return me;
	};
	
	return {
		Required: ['Users', 'Acl', 'Gate'],	
		Module: Module
	}
})();