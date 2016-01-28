/*  MODULE FILES */
var url = require('url'),
    fs = require('fs');
	
module.exports = (function(){
	/* Массив регистрируемых gпутей */
	var Directories = {
	
	};
	
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		
		function download(category, name, req, res){
			var path = App.path.schema + '/'+conf.name+'/data/' + name;
			res.download(path, function(err) {
				console.log('download', req.cookies);
				if (err) {
					res.writeHead(400, {'Content-type':'text/html'})
					console.log(err);
					res.end("No such file");    
				}
			}, function(err) {
				if (err) {
					res.writeHead(400, {'Content-type':'text/html'})
					console.log(err);
					res.end("Connect error");    
				}
			});
		};
		
		function upload(req, res, server, express){
			var multiparty = require('multiparty');
			// создаем форму
			var form = new multiparty.Form();
			//здесь будет храниться путь с загружаемому файлу, его тип и размер
			var uploadFile = {uploadPath: '', type: '', size: 0};
			//максимальный размер файла
			var maxSize = 2 * 1024 * 1024; //2MB
			//поддерживаемые типы(в данном случае это картинки формата jpeg,jpg и png)
			var supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
			//массив с ошибками произошедшими в ходе загрузки файла
			var errors = [];

			 //если произошла ошибка
			form.on('error', function(err){
				if(fs.existsSync(uploadFile.path)) {
					//если загружаемый файл существует удаляем его
					fs.unlinkSync(uploadFile.path);
					console.log('error');
				}
			});

			form.on('close', function() {
				//если нет ошибок и все хорошо
				if(errors.length == 0) {
					//сообщаем что все хорошо
					res.send({status: 'ok', text: 'Success'});
				}
				else {
					if(fs.existsSync(uploadFile.path)) {
						//если загружаемый файл существует удаляем его
						fs.unlinkSync(uploadFile.path);
					}
					//сообщаем что все плохо и какие произошли ошибки
					res.send({status: 'bad', errors: errors});
				}
			});

			// при поступление файла
			form.on('part', function(part) {
				//читаем его размер в байтах
				uploadFile.size = part.byteCount;
				//читаем его тип
				uploadFile.type = part.headers['content-type'];
				//путь для сохранения файла
				uploadFile.path = './files/' + part.filename;

				//проверяем размер файла, он не должен быть больше максимального размера
				if(uploadFile.size > maxSize) {
					errors.push('File size is ' + uploadFile.size + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
				}

				//проверяем является ли тип поддерживаемым
				if(supportMimeTypes.indexOf(uploadFile.type) == -1) {
					errors.push('Unsupported mimetype ' + uploadFile.type);
				}

				//если нет ошибок то создаем поток для записи файла
				if(errors.length == 0) {
					var out = fs.createWriteStream(uploadFile.path);
					part.pipe(out);
				}
				else {
					//пропускаем
					//вообще здесь нужно как-то остановить загрузку и перейти к onclose
					part.resume();
				}
			});

			// парсим форму
			form.parse(req);
			
			
			
			
			
			
			
			
			
			
			
			
			//var path   = App.path.schema + '/'+conf.name+'/data/';
			
			/*
			var upload = require('jquery-file-upload-middleware')				
				
				upload.configure({
					uploadDir: path,
					uploadUrl: me.config.upload
				});
			
				upload.fileHandler({
					uploadDir: function () {
						return __dirname + '/public/uploads/'
					},
					uploadUrl: function () {
						return '/uploads'
					}
				})(req, res);
			*/
			/*
			res.download(path, function(err) {
				console.log('download', req.cookies);
				if (err) {
					res.writeHead(400, {'Content-type':'text/html'})
					console.log(err);
					res.end("No such file");    
				}
			}, function(err) {
				if (err) {
					res.writeHead(400, {'Content-type':'text/html'})
					console.log(err);
					res.end("Connect error");    
				}
			});
			*/
		};
		
		
		function addDir(name, dir, filter, list, download, upload, acl) {
	
		};
	
		me.List = function(param){
			return require('util').inspect(Directories, param);
		};
		
		me.On = function(){
			return false;
		};
		
		me.Off = function(path) {
			return false; 
		};
		
		/* test object */
		me.On('Ping',
			function(auth, param, ok, err) {
				ok('Pong "'+param+'" ('+(typeof param)+'): '+me.List());	
			},
		'*');
		
		
		//Registre route
		/* api */
		App.Gate.regRoute('Files, download: "'+me.config.download+'"', function(server){
			server.get(me.config.download, function(req, res) {
				var query = url.parse(req.url, true).query;
				if (typeof req.params.file !== 'undefined') {
					download(req.params.category, req.params.file, req, res);
				} else {
					res.writeHead(404, {'Content-type':'text/html'})
					res.end("Bad file request, use '/files/:category/:file'"); 
				}
			});
		});
		
		/* UPLOAD */
		App.Gate.regRoute('Files, upload: "'+me.config.upload+'"', function(server, express){
			server.get(me.config.upload, function( req, res ){
				res.redirect('/');
			});
			server.put(me.config.upload, function( req, res ){
				res.redirect('/');
			});
			server.delete(me.config.upload, function( req, res ){
				res.redirect('/');
			});
			server.use(me.config.upload, function(req, res){
				upload(req, res, server, express);
			});
		});
		
		
		/* Init module */
		me.init = function(){
			log.param('    Directories:', Directories);
			console.log(me.List({ colors: true, showHidden: false, depth: null }));
		};
		
		return me;
	};
	
	return {
		Required: ['Acl', 'Gate'],	
		Module: Module
	}
})();