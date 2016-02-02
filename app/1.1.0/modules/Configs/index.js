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
		
		/*	
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
		*/
		
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
					if (typeof callback == 'function') callback(err, concat(data[1], data[0]));
				} else {
					if (typeof callback == 'function') callback(err, concat(data[0], data[1]));
				}
			});
			
		};
		
		/* Получить */
		function Get(box, name, callback) {
			async.parallel({
				module: function(cb){
					fs.readFile(path.resolve(box.module_data, name + box.ext), 'utf8', function(err, data){
						cb(null, (err) ? false : data);
					});
				},
				scheme: function(cb){
					fs.readFile(path.resolve(box.schema_data, name + box.ext), 'utf8', function(err, data){
						cb(null, (err) ? false : data);
					});
				}
			}, function(err, data){
				if (!data.scheme && !data.module) {return callback('not found');}
				var ret = (box.priority_scheme) ? (data.scheme || data.module) : (data.module || data.scheme);
				if (box.json) {
					try {
						ret = JSON.parse(ret);
					} catch(error) {
						if (typeof callback == 'function') callback(error);
						return;
					}
				}
				if (typeof callback == 'function') callback(err, ret);
			});
		}
		
		/* Установить */
		function Set(box, name, value, callback) {
			
			if (box.json) {
				try {
					value = JSON.stringify(value);
				} catch(error) {
					if (typeof callback == 'function') callback(error);
					return;
				}
			}
			async.parallel({
				module: function(cb){
					if (!box.root) {return cb(null, false)};
					
					if (!exist(box.module_data)){fs.mkdirSync(box.module_data);}
					
					fs.writeFile(path.resolve(box.module_data, name + box.ext), value, 'utf8', function(err){
						cb(null, (err) ? false : true);
					});
				},
				scheme: function(cb){
					if (box.root) {return cb(null, false)};
					
					if (!exist(box.schema_root)){fs.mkdirSync(box.schema_root);}
					if (!exist(box.schema_data)){fs.mkdirSync(box.schema_data);}
					
					fs.writeFile(path.resolve(box.schema_data, name + box.ext), value, 'utf8', function(err){
						cb(null, (err) ? false : true);
					});
				}
			}, function(err, data){
				if (typeof callback == 'function') callback(!(data.module || data.scheme));
			});
		}
		
		
		/* Удалить */
		function Delete(box, name, callback){
			async.parallel({
				module: function(cb){
					if (!box.root) {return cb(null, false)};
					fs.unlink(path.resolve(box.module_data, name + box.ext), function(err){
						cb(null, (err) ? false : true);
					});
				},
				scheme: function(cb){
					fs.unlink(path.resolve(box.schema_data, name + box.ext), function(err){
						cb(null, (err) ? false : true);
					});
				}
			}, function(err, data){
				if (typeof callback == 'function') callback(!(data.module || data.scheme));
			});	
		};
		
		me.Box = function(module, cfg){
			if (typeof(module) !== 'string' || typeof(App.modules[module]) === 'undefined') {return;}
		
			var config = App.utils.extend(true, {
				path: '',
				ext: '.json',
				json: true,
				root: false,
				priority_scheme: false
			}, cfg);
			
			
			var module_config  = App.modules[module].Config;
			config.module_root = module_config.path;
			config.module_data = path.resolve(config.module_root, config.path);
			config.schema_root = path.resolve(App.path.schema, module);
			config.schema_data = path.resolve(config.schema_root, config.path),
			
			console.param('Boxing', config);
			return {
				Config: function(cfg){config = App.utils.extend(true, {}, config, cfg); return config;},
				List:   function(callback){List(config, callback);},
				Get:    function(name, callback){Get(config, name, callback);},
				Set:    function(name, value, callback){Set(config, name, value, callback);},
				Delete: function(name, callback){Delete(config, name, callback);},
				Direct: {
					_List:	 'Info: Get a list of files. Param: (any) not used. Return: array of information about the files',
					_Get:	 'Info: Get the contents of the file. Param: name. Return: file contents',
					_Set:    'Info: Set the contents of the file. Param: {name, data}. Return: true',
					_Delete: 'Info: Delete a file. Param: name. Return: true',
					List:	function(ssid, param, ok, err) {List(config, function(error, data){if (!error) {ok(data);} else {err(error)}});},
					Get:	function(ssid, param, ok, err) {Get(config, param, function(error, data){if (!error) {ok(data);} else {err(error)}});},
					Set:	function(ssid, param, ok, err) {Set(config, param.name, param.data, function(error, data){if (!error) {ok(data);} else {err(error)}});},
					Delete:	function(ssid, param, ok, err) {Delete(config, param, function(error, data){if (!error) {ok(data);} else {err(error)}});}
				}
			};
		};
		
		me.init = function(){
			
			var box = me.Box(conf.name, {
				path: 'data',
				ext: '.lib',
				priority_scheme: true
			});
			
			if (box){
				console.param('Box', box);
				console.param('Box Config', box.Config());		
				box.List(function(err, data){
					console.log('Box List', !err, data);	
					box.Set('test_scheme', 'Test scheme', function(err){
						console.log('Box scheme Set', !err);	
						box.Get('test_scheme', function(err, data){
							console.log('Box scheme Get', !err, data);		
							box.Delete('test_scheme', function(err){
								console.log('Box scheme Delete', !err);							
								box.Config({root:true});
								box.Set('test_module', 'Test module', function(err){
									console.log('Box module Set', !err);
									box.Get('test_module', function(err, data){
										console.log('Box module Get', !err, data);
										box.Delete('test_module', function(err){
											console.log('Box module Delete', !err);
											console.param('Box Test', 'OK');
										});
									});
								});
							});		
						});
					});	
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