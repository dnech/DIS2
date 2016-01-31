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
			
		/* Удалить */
		function Delete(p, file, ok, err){
			if (p.admin) {
				fs.unlinkSync(path.resolve(p.module, './'+file+p.ext));
			}
			fs.unlinkSync(path.resolve(p.schema, './'+file+p.ext));
			if (typeof ok == 'function') {ok(true);}
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
		
		function _List(dir, ext, cb){
			async.waterfall([
				function(next) { // Получить состояние директории
					fs.stat(dir, next);
				},
				function(stat, next) { // Обработка статуса
					if (stat.isDirectory()) {
						next(null, dir);
					} else {
						next('is not a directory');
					}
				},
				fs.readdir, // Чтение файлов
				function(list, next){ // Фильтрация файлов
					var files = [];
					list.forEach(function(item, i, arr) {
						if (item.substring(item.length - ext.length) === ext) {
							files.push(path.resolve(dir, item));
						}
					});
					files.sort();
					next(null, files);
				},
				function (files, next){ // Получение статусов файлов
					async.map(files, fs.stat, function (err, stats) {
						if (err) {next(err);}
						next(null, files, stats);
					});
				},
				function (files, stats, next){
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
					next(null, f);
				}
			], function(err, data){
				if (err) {
					cb(null, []);
				} else {
					cb(null, data);
				}
			});
		};

		function List(param, callback){
			var module = path.resolve(conf.path, './data');
			var schema = path.resolve(path.resolve(App.path.schema,'./'+conf.name), './data');
	
			async.parallel([
				function(cb){_List(module, '.txt', cb)},
				function(cb){_List(schema, '.txt', cb)}
			], function(err, data){
				data[0].forEach(function(item) {item.type = 'system';});
				data[1].forEach(function(item) {item.type = 'scheme';});
				callback(err, data[0].concat(data[1]));
			});
			
		};
		
		me.init = function(){
			
			List('', function(err, data){
				console.log('err', err);
				console.log('data', data);
			});
			
			/*
			console.time('Create');
			for (var i=1; i<=50000; i++ ) {
				fs.writeFileSync(path.resolve(p, 'm'+i+'.txt'), 'Hello Node.js:'+i);
			}
			console.timeEnd('Create');
			*/
			
			/*
			console.time('GetAsync');
			test(path.resolve(conf.path, './data'), '.txt', function(err, data){
				if (err) {
					console.timeEnd('GetAsync');
					console.log('err', err);
				} else {
					console.timeEnd('GetAsync');
					//console.log('data', data);
				}
			});	
			*/	
			/*	
			console.time('GetSync');
			var p = {
				ext:    '.txt',
				module: path.resolve(conf.path, './data'),
			};
			List(p);
			console.timeEnd('GetSync');
			*/
		};
			
		//-- END --
		return me;
	};
	return {Required: Required,	Module: Module}
})();