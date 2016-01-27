/*  MODULE PANELS */
var path = require('path');
var fs   = require('fs');
var vm   = require('vm');

module.exports = (function(){
	var id = 0;
	
	function getData(data){
		return (typeof data === 'string') ? data : '';
	}
	function getId() {
		return ''+(++id);
	};
	
	function dataId(id, data) {
		return data.replace(/{ID}/g, id);
	};
	
	function runScript(src, name, id, ssid){
		var Panel = {};
		//log.param('    Run server script ', filename);
		try {
			var script = new vm.Script(src, { filename: 'Panel "'+name+'"' });
			App.Panels.List[id] = {
				Name: name,
				Ssid: ssid
			};
			Panel = script.runInThisContext();
			App.Panels.List[id].Panel = Panel;
			Panel = {success: true, data: Panel};
			//var sandbox = { "module": module, "result": false };
			//script.runInNewContext(sandbox);
		}
		catch(error) {
			console.log('ERROR: ', error);
			Panel = {success: false, error: error};
		}
		//log.param('    App.Direct ', App.Direct.Api());
		return Panel;
	}
	
	return {
		Required: ['Acl','Direct'],	
		Module: function(conf){
			var me = App.namespace(conf.name, conf);
			me.List = {};
			
			log.param('    Module "'+conf.name+'" conf: ', conf);
			
			var PathTemplateServer = path.resolve(conf.path, './templates/Server.template');
			var PathTemplateClient = path.resolve(conf.path, './templates/Client.template');
			
			
			var FormsPathModule = path.resolve(conf.path, './data');
			var FormsPathScheme = path.resolve(App.path.schema, './'+conf.name+'/data');
			
			log.param('    PathTemplateServer ', PathTemplateServer);
			log.param('    PathTemplateClient ', PathTemplateClient);
			log.param('    FormsPathModule ', FormsPathModule);
			log.param('    FormsPathScheme ', FormsPathScheme);
			
			me.Content = function(ssid, param, ok, err){
				/* -------------------------------- */
				var name = param;
				var data = '';
				if (typeof param === 'object') {
					name = param.name;
					data = param.data;
				}
				var data_json = 'JSON.parse(\''+JSON.stringify({data:data})+'\').data;';
				
				/* -------------------------------- */
				me.Get(ssid, name, 
					function(ans){
						try {
							var tpl_server = fs.readFileSync(PathTemplateServer, "utf8").toString('utf8');
							var tpl_client = fs.readFileSync(PathTemplateClient, "utf8").toString('utf8');
							
							var id  = getId();
							var Pname = 'Panel'+id;
							
							var server_data = tpl_server;
							server_data = server_data.replace(/{CODE}/g, getData(ans.data.server));
							server_data = server_data.replace(/{ID}/g, id);
							
							var Panel = runScript(server_data, name, id, ssid);
							if (Panel.success) {
								var client_data = tpl_client;
								client_data = client_data.replace(/{STYLE}/g, getData(ans.data.style.replace(/#ThisPanel/g, "#"+Pname)));
								client_data = client_data.replace(/{CONTENT}/g, getData(ans.data.panel));
								client_data = client_data.replace(/{DIRECT}/g, Panel.data.exportDirect);
								client_data = client_data.replace(/{CODE}/g, getData(ans.data.client));
								client_data = client_data.replace(/{DATA}/g, data_json);
								client_data = client_data.replace(/{ID}/g, id);
								
								ok({
									success: true,
									id: id,
									name: Pname,
									div: "#"+Pname,
									data: client_data
								});
							} else {
								err({
									success: false,
									msg: 'Server script ['+name+']: '+Panel.error
								});
							}
						} catch(error) {
							err({
								success: false,
								msg: 'Create content ['+name+']: '+error
							});
						}
					},
					function(error){
						err(error);
					}
				);
			};
			
			/* Список Панелей */
			me.List = function(ssid, param, ok, err){
				
				var list = [];
				
				fs.readdirSync(FormsPathScheme).forEach(function(item, i, arr) {
					if (item.substring(item.length - 6) === '.panel') {
						list.push({name:item.substring(0, item.length - 6), type: 'scheme'});
					}
				});
				
				fs.readdirSync(FormsPathModule).forEach(function(item, i, arr) {
					if (item.substring(item.length - 6) === '.panel') {
						if (list.indexOf(item.substring(0, item.length - 6)) < 0) {
							list.push({name:item.substring(0, item.length - 6), type: 'system'});
						}
					}
				});
				
				list.sort();
				
				ok({
					success: true,
					data: list
				});
			};
			
			/* Установить Панель */
			me.Set = function(ssid, param, ok, err){
				try {
					var file = path.resolve(FormsPathScheme, './'+param.name+'.panel');
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
			
			/* Получить Панель */
			me.Get = function(ssid, param, ok, err){
				var json_data = '';
				try {
					json_data = fs.readFileSync(path.resolve(FormsPathModule, './'+param+'.panel'), "utf8").toString('utf8');
				} catch(error) {
					try {
						json_data = fs.readFileSync(path.resolve(FormsPathScheme, './'+param+'.panel'), "utf8").toString('utf8');
					} catch(error) {
						err({
							success: false,
							msg: error
						});
					}
				}
				try {
					var data = JSON.parse(json_data);
					ok({
						success: true,
						name: param,
						data: data
					});
				} catch(error) {
					err({
						success: false,
						msg: ''+error
					});
				}
			};
			
			/* Получить Панель */
			me.Delete = function(ssid, param, ok, err){
				ok({
						success: true,
						name: param,
						data: ''
					});
			};
			
			/* Direct client */
			App.Direct.On({
				Panels:{
					Content: me.Content
				}
			}, '*');
			
			/* Direct configurator */
			App.Direct.On({
				Panels:{
					List: me.List,
					Set:  me.Set,
					Get:  me.Get,
					Delete: me.Delete
				}
			}, '#');
			
			me.init = function(){
				log.param('    Module "'+conf.name+'" INIT: ', conf);
			};
			
			return me;
		}
	}
})();