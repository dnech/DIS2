var zip = require('zlib');
var fs  = require("fs");
var path = require("path");
var mod = require("module");

/*********************************
		    COMMON
**********************************/	
var ident  = '<<<COMPRESSED>>>';


module.exports = (function(){
	
	/*
	           PACKER
	*/
	var Packer = function(name, basedir, clear) {
		var me = this;

		me.list = {};
		me.name = name;
		me.basedir = (basedir)?basedir:__dirname;
		me.ident  = ident;
		me.offset = ident.length;
		
		if (clear) {
			try {
				fs.unlinkSync(me.name);
			} catch (e) {}
		}
		
		me._readDir = function (filename, ignore) {
			for (idx in ignore) {
				if (path.normalize(filename).indexOf(ignore[idx])===0) {
					console.error('Игнорирование пути', path.normalize(filename));
					return;
				}	
			}
			var ls = fs.readdirSync(filename);
			ls.forEach(function(el, i){
				var elem = path.join(filename, ls[i]);
				var stat = fs.statSync(elem);
				if (stat && stat.isDirectory()) {
					me._readDir(elem, ignore);
				} else {
					me._readFile(elem, ignore);
				}
			});
		};
		
		me._readFile = function(filename, ignore) {
			for (idx in ignore) {
				if (path.normalize(filename).indexOf(ignore[idx])===0) {
					console.error('Игнорирование пути',path.normalize(filename));
					return;
				}	
			}
			var file = filename.replace(me.basedir,"%ROOT%");
			if (!me.list[file]){
				console.info('Add: '+filename+' as '+file);
				var data = zip.gzipSync(new Buffer(fs.readFileSync(filename))); //new Buffer(me.fs.readFileSync(filename, "utf8"));
				me.list[file] = {
					offset: me.offset,
					length: data.length
				}
				
				if (me.offset == me.ident.length) {fs.appendFileSync(me.name, me.ident);}
				fs.appendFileSync(me.name, data); 
				
				me.offset += data.length;
			}
		};
		
		me.add = function(dir, ignore) {
			for (idx in ignore) {
				ignore[idx] = path.normalize(ignore[idx]);
			}
			me._readDir(path.normalize(dir), ignore);
		}
		
		me.save = function() {
			var table = zip.gzipSync(new Buffer(JSON.stringify(me.list)));	
			fs.appendFileSync(me.name, table); 

			var buf = new Buffer(4);
			buf.fill(0);
			buf.writeUInt32BE(table.length);
			fs.appendFileSync(me.name, buf); 
		}
		
		me.load = function() {
			var stat = fs.statSync(me.name);
			if (stat.size < me.ident.length+4) {
				console.info('FILE BAD FILE SIZE');
				return false;
			}
			
			//console.log('FILE SIZE: ', stat.size);
			
			var fd = fs.openSync(me.name, "r");
			
			var data = new Buffer(me.ident.length);
			fs.readSync(fd, data, 0, me.ident.length);
			//console.log('FILE IDENT', data.toString());
			
			data = new Buffer(4);
			fs.readSync(fd, data, 0, 4, stat.size-4);
			//console.log('FILE TABLE SIZE', data);
			var integer = data.readUInt32BE(data);
			//console.log('FILE TABLE SIZE', integer);
			
			data = new Buffer(integer);
			fs.readSync(fd, data, 0, integer, stat.size-integer-4);
			data = zip.gunzipSync(data);
			//console.log('TABLE', data.toString());
			me.list = JSON.parse(data.toString());
			fs.closeSync(fd);
		}
		
		me.getResource = function(filename, change) {
			try {
				var file = change ? filename.replace(me.basedir,"%ROOT%") : filename;
				var res = me.list[file];
				if (res){
					var fd = fs.openSync(me.name, "r");
					var data = new Buffer(res.length);
					fs.readSync(fd, data, 0, res.length, res.offset);
					fs.closeSync(fd);
					return zip.gunzipSync(data).toString("utf8");
				} else {
					console.error('Error: getResource > Resouce '+file+' not found.');
					return undefined;
				}
			} catch (err) {
				console.error('Error: getResource ', file, err.message);
				return undefined;
			}
		}
		
		me.extract = function(base) {
			try {
				for(var file in me.list) {
					console.log('Extract: ', file);
					var filename = file.replace("%ROOT%", base);
					me.mkdir(path.dirname(filename));
					fs.writeFileSync(filename, me.getResource(file), 'utf8');
				}
				return true;
			} catch (err) {
				console.error('Error: extract ', err.message);
				return false;
			}
		}
		
		me.mkdir = function (p, opts, made) {
			if (!opts || typeof opts !== 'object') {
				opts = { mode: opts };
			}
			
			var mode = opts.mode;
			var xfs = opts.fs || fs;
			
			if (mode === undefined) {
				mode = parseInt('0777', 8) & (~process.umask());
			}
			if (!made) made = null;

			p = path.resolve(p);

			try {
				xfs.mkdirSync(p, mode);
				made = made || p;
			}
			catch (err0) {
				switch (err0.code) {
					case 'ENOENT' :
						made = me.mkdir(path.dirname(p), opts, made);
						me.mkdir(p, opts, made);
						break;

					// In the case of any other error, just see if there's a dir
					// there already.  If so, then hooray!  If not, then something
					// is borked.
					default:
						var stat;
						try {
							stat = xfs.statSync(p);
						}
						catch (err1) {
							throw err0;
						}
						if (!stat.isDirectory()) throw err0;
						break;
				}
			}

			return made;
		};

		return me;
	}
	
	/*
			            UNPACKER
	*/
	var UnPacker = function() {
		var me = this;
		me.list = {};
		me.ident  = '<<<COMPRESSED>>>';
		
		//-------------------------------------------------------------------------------------------------------
		me.addPack = function(filename, basedir){
			try {
				basedir = (basedir)?basedir:__dirname;
				var stat = fs.statSync(filename);
				if (stat.size < me.ident.length+4) {
					console.log('BAD FILE SIZE');
					return false;
				}
				
				var fd = fs.openSync(filename, "r");
				// Get Ident
				var ident = new Buffer(me.ident.length);
				fs.readSync(fd, ident, 0, me.ident.length);
				if (ident.toString("utf8") !== me.ident) {
					console.log('BAD FILE FORMAT');
					return false;
				}
				
				// Get Table Size
				var size = new Buffer(4);
				fs.readSync(fd, size, 0, 4, stat.size-4);
				size = size.readUInt32BE(size);
				
				// Get Table
				var table = new Buffer(size);
				fs.readSync(fd, table, 0, size, stat.size-size-4);
				fs.closeSync(fd);
				
				
				table = zip.gunzipSync(table);
				table = JSON.parse(table.toString("utf8"));
				
				for(var index in table) {
					var file = path.normalize(index.replace('%ROOT%',basedir)); 
					me.list[file] = {
						src: filename,				
						offset: table[index].offset,
						length: table[index].length
					}
				}
				
				return true;
				
			} catch (err) {
				console.error('Error: addPack ', filename, err.message);
				return false;
			}
	 
		};
		
		//-------------------------------------------------------------------------------------------------------
		me.getList = function(){
			return me.list;
		};
		
		//-------------------------------------------------------------------------------------------------------
		me.getResource = function(filename) {
			try {
				var res = me.list[filename];
				if (res){
					var fd = fs.openSync(res.src, "r");
					var data = new Buffer(res.length);
					fs.readSync(fd, data, 0, res.length, res.offset);
					fs.closeSync(fd);
					
					return zip.gunzipSync(data).toString("utf8");
					
				} else {
					console.error('Error: getResource > Resouce '+filename+' not found.');
					return undefined;
				}
			} catch (err) {
				console.error('Error: getResource ', filename, err.message);
				return undefined;
			}
		};
		
		//-------------------------------------------------------------------------------------------------------
		// Поиск в таблице 
		me.exist = function(filename, ext){
			ext = ext || '';
			return me.list[filename] ? filename+ext : undefined; 
		}
		
		//-------------------------------------------------------------------------------------------------------
		// 1. Поиск по расширению как есть
		me.tryFile = function(filename){
			return me.exist(filename, '.pack');
		}
		
		//-------------------------------------------------------------------------------------------------------
		// 2. Поиск подставляя расширения .js .json .node
		me.tryExtension = function(filename){
			return me.exist(filename+'.js',   '.pack') || 
				   me.exist(filename+'.json', '.pack') ||
				   me.exist(filename+'.node', '.pack'); 
		}
		
		//-------------------------------------------------------------------------------------------------------
		// 3. Поиск package.json
		me.tryPackage = function(filename){
			try {
				var pack = me.exist(path.resolve(filename, 'package.json'));
				if (pack) {
					var link = JSON.parse(me.getResource(pack)).main;
					return me.findPath(path.resolve(filename, link));
				}
			} catch (err) {}	
			return undefined;
		}
		
		//-------------------------------------------------------------------------------------------------------
		// 4. Поиск index.js
		me.tryFolder = function(filename){
			return me.exist(path.resolve(filename, 'index.js'), '.pack'); 
		}
		
		//-------------------------------------------------------------------------------------------------------
		// All
		me.findPath = function(filename){
			return me.tryFile(filename) || me.tryExtension(filename) || me.tryPackage(filename) || me.tryFolder(filename); 
		};
		
		//-------------------------------------------------------------------------------------------------------
		//_findPath
		mod._findPathOrig = mod._findPath;
		mod._findPath = function(request, paths) {
			var ret = mod._findPathOrig(request, paths);
			//log.info('----------- '+request+' ++++++++++++++ '+ret);
			if (!ret) {
				// For each path
				try {
					//console.log('--------------------------------------------------');
					//console.log('REQUEST >>> ',  request);
					for (var i = 0, PL = paths.length; i < PL; i++) {
						var filename = me.findPath(path.normalize(path.resolve(paths[i], request)));
						if (filename) {
							//console.log('PATH >>> ',  filename);
							return filename;
						}
					}
				} catch (err) {}
			}
			return ret;
		};
		
		//-------------------------------------------------------------------------------------------------------
		mod._extensions['.pack'] = function(module, filename) {	
			filename = filename.replace('.pack','');

			if (path.parse(filename).ext === '.js') {
				module._compile(me.getResource(filename), filename);
			}
			
			if (path.parse(filename).ext === '.json') {
				try {
					module.exports = JSON.parse(me.getResource(filename));
				} catch (err) {
					err.message = filename + ': ' + err.message;
					throw err;
				}
			}
		}
		return me;
	};
	return {pack:Packer, unpack:UnPacker};
})();	
