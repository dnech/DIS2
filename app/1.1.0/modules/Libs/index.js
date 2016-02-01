/*  MODULE LIB */
var path = require('path');
var fs   = require('fs');

module.exports = (function(){
	return {
		Required: ['Logger', 'Configs', 'Acl', 'Direct'],	
		Module: function(conf){
			var me = App.namespace(conf.name, conf);
			var console = App.Logger.console(conf.name, me.config.logger);
			console.info('Load');
			
			
			me.List = {};
			
			console.param('conf', conf);
			
			var DataPathModule = path.resolve(conf.path, './data');
			var DataPathScheme = path.resolve(App.path.schema, './'+conf.name+'/data');
			
			console.param('DataPathModule', DataPathModule);
			console.param('DataPathScheme', DataPathScheme);
			
			
			/* Список */
			function ListLib() {
				var list = [];
				fs.readdirSync(DataPathScheme).forEach(function(item, i, arr) {
					if (item.substring(item.length - 4) === '.lib') {
						list.push({name:item.substring(0, item.length - 4), type: 'scheme'});
					}
				});
				fs.readdirSync(DataPathModule).forEach(function(item, i, arr) {
					if (item.substring(item.length - 4) === '.lib') {
						if (list.indexOf(item.substring(0, item.length - 4)) < 0) {
							list.push({name:item.substring(0, item.length - 4), type: 'system'});
						}
					}
				});
				list.sort();
				return list;
			};
			
			me.List = function(ssid, param, ok, err){
				ok({
					success: true,
					data: ListLib()
				});
			};
			
			/* Установить */
			me.Set = function(ssid, param, ok, err){
				try {
					var file = path.resolve(DataPathScheme, './'+param.name+'.lib');
					var data = JSON.stringify(param.data);
					fs.writeFileSync(file, data, 'utf8');
					ok({
						success: true,
						data: param.name
					});
				} catch(error) {
					err({
						success: false,
						msg: ''+error
					});
				}
			};
			
			function GetLib(name){
				//console.log('GetLib', name);
				var json_data = '';
				try {
					json_data = fs.readFileSync(path.resolve(DataPathModule, './'+name+'.lib'), "utf8").toString('utf8');
				} catch(error) {
					try {
						json_data = fs.readFileSync(path.resolve(DataPathScheme, './'+name+'.lib'), "utf8").toString('utf8');
					} catch(error) {
						//console.log('GetLib1 Error', error);
						return {
							success: false,
							msg: ''+error
						};
					}
				}
				try {
					var data = JSON.parse(json_data);
					//console.log('GetLi', data);
					return {
						success: true,
						name:    name,
						data:    data
					};
				} catch(error) {
					//console.log('GetLib2 Error', error);
					return {
						success: false,
						msg: ''+error
					};
				}
			}
			
			/* Получить */
			me.Get = function(ssid, param, ok, err){
				var data = GetLib(param);
				if (data.success){
					ok(data);
				} else {
					err(data);
				}
			};
			
			/* Direct client */
			/*
			App.Direct.On({
				Libs:{
					Content: me.Content
				}
			}, '*');
			*/
			
			/* Direct configurator */
			App.Direct.On({
				Libs:{
					List: me.List,
					Set:  me.Set,
					Get:  me.Get
				}
			}, '#');
			
			function ContentLib(ssid, type) {
				var list    = ListLib();	
				var content = '';
				for (var key in list) {
					var lib = GetLib(list[key].name);
					if (lib.success){
						//console.log('GetLib', lib, ssid, type);
						if (type === 'html') {
							content += '<!-- Lib "'+lib.name+'.'+type+'" for ssid: '+ssid+' -->\r'+lib.data[type]+'\r\r';
						}
						if (type === 'css') {
							content += '/* Lib "'+lib.name+'.'+type+'" for ssid: '+ssid+' */ \r'+lib.data[type]+'\r\r';
						}
						if (type === 'js') {
							content += '/* Lib "'+lib.name+'.'+type+'" for ssid: '+ssid+' */ \r'+lib.data[type]+'\r\r';
						}
						if (type === 'raw') {
							content += '<!-- Lib "'+lib.name+'"  for ssid: '+ssid+' -->\r<style>'+lib.data['css']+'</style>'+lib.data['html']+'\r<script>'+lib.data['js']+'</script>\r\r';
						}
					}
				}

				return content;
			};
			
			
			function runScript(src, sandbox, name){
				name = name || 'unknow';
				try {
					var vm      = require('vm');
					var script  = new vm.Script("(function(){return function(){ "+src+" };})();", { filename: 'Libs/'+name });
					var data    = script.runInContext(new vm.createContext(sandbox));
					return {success: true,  data: data()};
				} catch(error) {
					return {success: false, data: error, module:conf.name, path:'runScript'};
				}
			};
			
			
			me.TaDa = function(name, cfg, callback) {
				// Подготовка конфига для запуска скрипта
				var config = {
					ssid:'',
					rights_use: [],
					rights_including: [],
					rights_except: [],
					sandbox: {
						Libs: {
							module: me,
							name: name
						},
						App: App,
						render: function(info) {
							console.log('Render'+info);
						},
						text: function(info) {
							return info;
						}
					}
				};
				App.utils.extend(true, config, cfg || {});
				
				
				// Подготовка исходника скрипта
				//var src =	"render('App'+(typeof App)); render('animal'+(typeof animal)); return text('Hello');";
				//var src =	"console.log('animal', typeof animal, animal); console.log('App', typeof App.Test, App.Test); App.Test = 'DJ'; console.log(' App.Test Run:', App.Test);return 'OK';";
			
				
				var src = 	" return function(callback){ "+
							"	console.log(Libs); "+
							"	var path = require('path'); "+
							"	var JUST = require('just'); "+
							"	var just = new JUST({ root : path.resolve(Libs.module.path, './view'), useCache : true, ext : '.html' }); "+
							"	just.render(Libs.name, { title: 'Hello, World!' }, function(err, html){callback({success:!err, data:html});}); "+
							" }; " 
				
				//var src = " return function(){}; ";				
					//(function(){ return function(data){return '123';};})();"; //+
					//"	var JUST = require('just'); "+
					//"	var just = new JUST({ root : path.resolve(conf.path, './view'), useCache : true, ext : '.html' }); "+
					//"	just.render(name, { title: 'Hello, World!' }, callback); "+
					//"};)";
					
				try {
					callback(runScript(src, config.sandbox, name));
				} catch(error) {
					callback({success: false, data: error, module:conf.name, path:'TaDa'});
				}
				
				
				//var result = runScript(src, sandbox, name); //{success:true, data:'456789'}; // 
				//if (result.success) {
				//	console.log(' AA:'+name+'+', result.success, result.data);
					
					//callback(result.success, result.data.apply(this, config.data));
				//	callback(result.success, result.data());
					
					//result.data(callback);
				//} else {
				//	console.log(' AA:'+name+'-', result.success, result.error);
				//	callback(result.success, result.error);
				//}
				
				//console.log(' App.Test Afrter:', App.Test);
				
				//"var Content = function(callback){"+
				//var src =		"	var JUST = require('just'); "+
				//				"	var just = new JUST({ root : path.resolve(conf.path, './view'), useCache : true, ext : '.html' }); "+
				//				"	just.render(content, { title: 'Hello, World!' }, callback);"; //+
							//"};"; 
				
				//try {
				//	eval(src);
				//} catch(error) {
				//	callback(false, error);
				//}



				
				//var fn = function(content, callback) {
				//	var JUST = require('just'); 
				//	var just = new JUST({ root : path.resolve(conf.path, './view'), useCache : true, ext : '.html' }); 
				//	just.render(content, { title: 'Hello, World!' }, callback);
				//};
				
				//var src =	"return function(content, callback) {";
				//			"	var JUST = require('just'); "+
				//			"	var just = new JUST({ root : path.resolve(conf.path, './view'), useCache : true, ext : '.html' }); "+
				//			"	just.render(content, { title: 'Hello, World!' }, callback);"+
				//			"};"; 
							
				//var Content = runScript(src, content);
				//console.log('Content', Content);
				//if (Content.success){
				//	Content.data.call(this);
				//} else {
				//	callback(Content.success, Content.error);
				//}
				//fn(content, callback);
				
				//return 'Okey! content:'+content+', config:'+JSON.stringify(config);
			};
			
			//Registre route
			App.Gate.regRoute('Libs, type:[raw, html, css, js], url: "'+me.config.url+'"', function(server){
				server.get(me.config.url, function(req, res) {
					var ssid = '0';
					//console.log('cookies', req.cookies);
					if ((typeof req.cookies !== 'undefined') && (typeof req.cookies[me.config.ssid] !== 'undefined')) {
						ssid = req.cookies[me.config.ssid];
						//console.log('SSID exist', ssid);
					}
					/*else {
						var ssid = require('node-uuid').v4();
						res.cookie(me.config.ssid, ssid);
						console.log('SSID NOT exist, create new...', ssid);
					}*/
					//console.log('Libs', ssid, req.params.type);
					res.end(ContentLib(ssid, req.params.type));
				});
			});
			
			me.init = function(){
				console.info('Init');
				/*var lib = App.Configs.Box(conf.name, './data', '.lib');
				console.param('lib', lib);
				lib.Set('temp1', {name:'temp'});
				lib.Set('temp2', {name:'temp'});
				lib.Delete('temp2');
				
				App.Direct.On({
					Libs: lib.Direct
				}, '#');
				*/
			};
			
			return me;
		}
	}
})();