/*  MODULE CONFIGS */	
module.exports = (function(){
	var Required = ['Logger'];
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		//-- BEGIN --
		
		var async = require('async'); 
		var path  = require('path');
		var fs    = require('fs');
		
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
							list.push({
								name: item.substring(0, item.length - p.ext.length),
								type: type,
								stat: {
									size: stats.size,
									birthtime: stats.birthtime,
									atime: stats.atime,
									mtime: stats.mtime,
									ctime: stats.ctime
								}
							});
						}
					});
				}
			};
			
			//if (p.admin) {
				scan(p.module, 'system');
			//	scan(p.schema, 'scheme');
			//} else {
			//	scan(p.schema, 'scheme');
			//	scan(p.module, 'system');
			//}
			
			
			//if (cb) {cb(null, list);}
			return list;
		};
		
		/* Установить */
		function Set(p, file, data, ok, err){
			try {
				if (p.admin) {
					if (!exist(p.module)){fs.mkdirSync(p.module);}
					var file = path.resolve(p.module, './'+file+p.ext);
				} else {
					if (!exist(p.schemapath)){fs.mkdirSync(p.schemapath);}
					if (!exist(p.schema)){fs.mkdirSync(p.schema);}
					var file = path.resolve(p.schema, './'+file+p.ext);
				}	
				if (p.json) { data = JSON.stringify(data); }
				fs.writeFileSync(file, data, 'utf8');
				if (typeof ok == 'function') {ok(true);}
			} catch(error) {
				if (typeof err == 'function') {err(error);}
			}
		};
			
		/* Получить */
		function Get(p, file, ok, err){
			var data = '';
			
			try { path.resolve(dir, item)
				data = fs.readFileSync(path.resolve(p.module, './'+file+p.ext), "utf8").toString('utf8');
			} catch(error) {
				try {
					data = fs.readFileSync(path.resolve(p.schema, './'+file+p.ext), "utf8").toString('utf8');
				} catch(error) {
					if (typeof err == 'function') {err(error);}
				}
			}
			
			try {
				if (p.json) { data = JSON.parse(data); }
				if (typeof ok == 'function') {ok(data);}
			} catch(error) {
				if (typeof err == 'function') {err(error);}
			}
		};
			
			
		me.Box = function(module, addpath, ext, admin){
			var cfg = App.modules[module].Config;
			addpath = addpath || '';
			ext = ext || '';
			var p = {
				ext: ext,
				json: true,
				admin: (admin ? true : false),
				module: path.resolve(cfg.path, addpath),
				schema: path.resolve(path.resolve(App.path.schema,'./'+cfg.name), addpath),
				schemapath: path.resolve(App.path.schema,'./'+cfg.name)
			};
			
			var obj = {
				path: p,
				List:   function(ok, err){List(p, ok, err);},
				Get:    function(file, ok, err){Get(p, file, ok, err);},
				Set:    function(file, data, ok, err){Set(p, file, data, ok, err);},
				Delete: function(file, ok, err){Delete(p, file, ok, err);},
				Direct: {
					_List:	 'Info: Get a list of files. Param: (any) not used. Return: array of information about the files',
					_Get:	 'Info: Get the contents of the file. Param: name. Return: file contents',
					_Set:    'Info: Set the contents of the file. Param: {name, data}. Return: true',
					_Delete: 'Info: Delete a file. Param: name. Return: true',
					List:	function(ssid, param, ok, err) {List(p, ok, err);},
					Get:	function(ssid, param, ok, err) {Get(p, param, ok, err);},
					Set:	function(ssid, param, ok, err) {Set(p, param.name, param.data, ok, err);},
					Delete:	function(ssid, param, ok, err) {Delete(p, param, ok, err);}
				}
			};
			
			return obj;
		};

		
		/* Список */
		function List(box, callback){
			
			function concat(arr1, arr2){
				var files = {};
				arr1.forEach(function(item) {
					files[item.name] = item;
					delete(files[item.name].name);
				});
				arr2.forEach(function(item) {
					if (typeof(files[item.name]) === 'undefined') {
						files[item.name] = item;
						delete(files[item.name].name);
					}
				});
				return files;
			}
			
			function _List(dir, ext, callback){
				function start(err, stat) {
					if (stat && stat.isDirectory()) {
						return fs.readdir(dir, step1);
					} 
					return stop('is not a directory');
				}
				
				function step1(err, list){
					if (err) {return stop(err);}
					var files = [];
					list.forEach(function(item, i, arr) {
						if (item.substring(item.length - ext.length) === ext) {
							files.push(path.resolve(dir, item));
						}
					});
					files.sort();
					async.map(files, fs.stat, function (err, stats) {
						if (err) {return stop(err);}
						step2(files, stats);
					});
				}
				
				function step2(files, stats){
					var f = [];
					files.forEach(function(item, i, arr) {
						f.push({
							name: path.basename(item, ext),
							ext: ext,
							stat: {
								size: stats[i].size,
								birthtime: stats[i].birthtime,
								atime: stats[i].atime,
								mtime: stats[i].mtime,
								ctime: stats[i].ctime
							}});
					});
					stop(null, f);
				}
				
				function stop(err, data) {
					if (err) {
						callback(null, []);
					} else {
						callback(null, data);
					}
				}			
				fs.stat(dir, start);
			};
			
			async.parallel([
				function(cb){_List(box.module_data, box.ext, cb)},
				function(cb){_List(box.schema_data, box.ext, cb)}
			], function(err, data){
				data[0].forEach(function(item) {item.type = 'system';});
				data[1].forEach(function(item) {item.type = 'scheme';});
				
				if (box.priority_scheme){
					callback(err, concat(data[1], data[0]));
				} else {
					callback(err, concat(data[0], data[1]));
				}
			});
			
		};
		
		/* Удалить */
		function Delete(box, name, callback){
			async.parallel([
				function(cb){
					if (!box.root) {return cb(null, false)};
					fs.unlink(path.resolve(box.module_data, name + box.ext), function(err){
						cb(null, (err) ? false : true);
					});
				},
				function(cb){
					fs.unlink(path.resolve(box.schema_data, name + box.ext), function(err){
						cb(null, (err) ? false : true);
					});
				}
			], function(err, data){
				callback(!(data[0] || data[1]));
			});	
		};
		
		me.Boxing = function(module, config){
			if (typeof(module) !== 'string' || typeof(App.modules[module]) === 'undefined') {return;}
			
			config = App.utils.extend(true, {}, {
				path: '',
				ext: '.json',
				json: true,
				root: false,
				priority_scheme: false
			}, config);
			
			var module_config  = App.modules[module].Config;
			config.module_root = module_config.path;
			config.module_data = path.resolve(config.module_root, config.path);
			config.schema_root = path.resolve(App.path.schema, module);
			config.schema_data = path.resolve(config.schema_root, config.path),
			
			console.param('Boxing', config);
			return {
				config: config,
				List:   function(callback){List(config, callback);},
				Delete: function(name, callback){Delete(config, name, callback);}
			};
		};
		
		me.init = function(){
			
			var box = me.Boxing('Libs', {
				path: 'data',
				ext: '.lib',
				//root: true
			});
			
			if (box){
				console.log('box', box);
				
				box.List(function(err, data){
					console.log('data', data);
				});
				
				box.Delete('del', function(err){
					console.log('Delete err', err);
				});
			}
			
			/*
			List('', function(err, data){
				console.log('err', err);
				console.log('data', data);
			});
			*/
		};
			
		//-- END --
		return me;
	};
	return {Required: Required,	Module: Module}
})();