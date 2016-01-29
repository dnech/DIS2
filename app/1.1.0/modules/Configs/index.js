/*  MODULE CONFIGS */	
module.exports = (function(){
	var Required = ['Logger'];
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		//-- BEGIN --
		
		var path = require('path');
		var fs   = require('fs');
		
		// Logger.console
		var console = App.Logger.console(conf.name, me.config.logger);
		console.info('Load');
		
		function exist(p){
			try {
				fs.accessSync(p, fs.F_OK);
				return true;
			} catch (e) {
				return false;
			}
		};
		
		function List(p){
			var list = [];	
			
			function scan(dir, type){
				if (exist(dir)) {
					fs.readdirSync(dir).forEach(function(item, i, arr) {
						if (item.substring(item.length - p.ext.length) === p.ext) {
							var stats = fs.statSync(path.resolve(dir, item));
							list.push({name:item.substring(0, item.length - p.ext.length), type: type, stats:stats});
						}
					});
				}
			};
			
			if (p.admin) {
				scan(p.module, 'system');
				scan(p.schema, 'scheme');
			} else {
				scan(p.schema, 'scheme');
				scan(p.module, 'system');
			}
			
			list.sort();
			return list;
		};
		
		/* Установить */
		function Set(p, file, data){
			try {
				if (p.admin) {
					if (!exist(p.module)){fs.mkdirSync(p.module);}
					
					var file = path.resolve(p.module, './'+file+p.ext);
					var data = JSON.stringify(data);
					fs.writeFileSync(file, data, 'utf8');
					return {success: true};
				} else {
					if (!exist(p.schemapath)){fs.mkdirSync(p.schemapath);}
					if (!exist(p.schema)){fs.mkdirSync(p.schema);}
					
					var file = path.resolve(p.schema, './'+file+p.ext);
					var data = JSON.stringify(data);
					fs.writeFileSync(file, data, 'utf8');
					return {success: true};
				}
			} catch(error) {
				return {success: false, msg: error};
			}
		};
			
		/* Получить */
		function Get(p, file){
			var json_data = '';
			
			try { path.resolve(dir, item)
				json_data = fs.readFileSync(path.resolve(p.module, './'+file+p.ext), "utf8").toString('utf8');
			} catch(error) {
				try {
					json_data = fs.readFileSync(path.resolve(p.schema, './'+file+p.ext), "utf8").toString('utf8');
				} catch(error) {
					return {success: false, msg: error};
				}
			}
			
			try {
				var data = JSON.parse(json_data);
				return {success: true, data: data};
			} catch(error) {
				return {success: false, msg: error};
			}
		};
			
		/* Удалить */
		function Delete(p, file){
			if (p.admin) {
				fs.unlinkSync(path.resolve(p.module, './'+file+p.ext));
			}
			fs.unlinkSync(path.resolve(p.schema, './'+file+p.ext));
		};
			
		me.filebox = function(module, addpath, ext, admin){
			var cfg = App.modules[module].Config;
			addpath = addpath || '';
			ext = ext || '';
			var p = {
				ext: ext,
				admin: (admin ? true : false),
				module: path.resolve(cfg.path, addpath),
				schema: path.resolve(path.resolve(App.path.schema,'./'+cfg.name), addpath),
				schemapath: path.resolve(App.path.schema,'./'+cfg.name)
			};
			
			var obj = {
				path: p,
				list:   function(){return List(p);},
				get:    function(file){return Get(p, file);},
				set:    function(file, data){return Set(p, file, data);},
				delete: function(file){return Delete(p, file);} 
			};
			
			return obj;
		};
		
		//-- END --
		return me;
	};
	return {Required: Required,	Module: Module}
})();