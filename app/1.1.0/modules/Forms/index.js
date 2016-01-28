/*  MODULE FORMS */
var path = require('path');
var fs   = require('fs');
var vm   = require('vm');

module.exports = (function(){
	var id = 0;
	
	function getId() {
		return 'Id'+(++id);
	};
	
	function dataId(id, data) {
		return data.replace(/{ID}/g, 'Id'+id);
	};
	
	function runScript(src, name, id, ssid){
		var Interface = {};
		//log.param('    Run server script ', filename);
		try {
			var script = new vm.Script(src, { filename: 'Forms.'+name });
			App.Forms.List[id] = {
				Name: name,
				Ssid: ssid
			};
			Interface = script.runInThisContext();
			App.Forms.List[id].Interface = Interface;
			
			//var sandbox = { "module": module, "result": false };
			//script.runInNewContext(sandbox);
		}
		catch(error) {
			console.log('ERROR: ' + error);
		}
		//log.param('    App.Direct ', App.Direct.Api());
		return Interface;
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
			
			me.getContent = function(ssid, param, ok, err){
				var name = param;
				var data = '';
				if (typeof param === 'object') {
					name = param.name;
					data = param.data;
				}
				var data_json = 'JSON.parse(\''+JSON.stringify({data:data})+'\').data;';
				try {
					//log.param('    MODULE1  ', name);
					var file_ui = path.resolve(FormsPathModule, './'+name+'.html');
					var file_js = path.resolve(FormsPathModule, './'+name+'.client.js');
					var file_sr = path.resolve(FormsPathModule, './'+name+'.server.js');
					//log.param('    MODULE2  ', name);
					
					var tpl_server = fs.readFileSync(PathTemplateServer, "utf8").toString('utf8');
					var tpl_client = fs.readFileSync(PathTemplateClient, "utf8").toString('utf8');
					var str_ui = fs.readFileSync(file_ui, "utf8").toString('utf8');
					var str_js = fs.readFileSync(file_js, "utf8").toString('utf8');
					var str_sr = fs.readFileSync(file_sr, "utf8").toString('utf8');
					
					//log.param('    MODULE3  ', name);
					var id = getId();
					
					var server_data = tpl_server;
					server_data = server_data.replace(/{CODE}/g, str_sr);
					server_data = server_data.replace(/{ID}/g, id);
					
					var Interface = runScript(server_data, name, id, ssid);
					
					var client_data = tpl_client;
					client_data = client_data.replace(/{CONTENT}/g, str_ui);
					client_data = client_data.replace(/{DIRECT}/g, Interface.exportDirect);
					client_data = client_data.replace(/{CODE}/g, str_js);
					client_data = client_data.replace(/{DATA}/g, data_json);
					client_data = client_data.replace(/{ID}/g, id);
					
					//log.param('    MODULE4  ', name);
					ok({
						success: true,
						data: client_data
					});
				} catch(error) {
					try {
						//log.param('    SCHEME1  ', name);
						var file_ui = path.resolve(FormsPathScheme, './'+name+'.html');
						var file_js = path.resolve(FormsPathScheme, './'+name+'.client.js');
						var file_sr = path.resolve(FormsPathScheme, './'+name+'.server.js');
						//log.param('    SCHEME2  ', name);
						
						var tpl_server = fs.readFileSync(PathTemplateServer, "utf8").toString('utf8');
						var tpl_client = fs.readFileSync(PathTemplateClient, "utf8").toString('utf8');
						var str_ui = fs.readFileSync(file_ui, "utf8").toString('utf8');
						var str_js = fs.readFileSync(file_js, "utf8").toString('utf8');
						var str_sr = fs.readFileSync(file_sr, "utf8").toString('utf8');
						
						//log.param('    SCHEME3  ', name);
						var id = getId();
						
						var server_data = tpl_server;
						server_data = server_data.replace(/{CODE}/g, str_sr);
						server_data = server_data.replace(/{ID}/g, id);
						
						var Interface = runScript(server_data, name, id, ssid);
						
						var client_data = tpl_client;
						client_data = client_data.replace(/{CONTENT}/g, str_ui);
						client_data = client_data.replace(/{DIRECT}/g, Interface.exportDirect);
						client_data = client_data.replace(/{CODE}/g, str_js);
						client_data = client_data.replace(/{DATA}/g, data_json);
						client_data = client_data.replace(/{ID}/g, id);
						ok({
							success: true,
							data: client_data
						});
					} catch(error) {
						log.param('    ERROR1  ', name);
						err({
							success: false,
							msg: error
						});
					}
				}
				err({
					success: false,
					msg: 'Unknow'
				});
			};
			
			App.Direct.On({
				Forms:{
					getContent: me.getContent
				}
			}, '*');
			
			me.init = function(){
				log.param('    Module "'+conf.name+'" INIT: ', conf);
			};
			
			return me;
		}
	}
})();