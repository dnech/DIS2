/*  MODULE */

module.exports = (function(){	
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		
		// Users:
		//   Admin
		//   Manager
		//   User
		// Roles:
		//   Administrators
		//   Managers
		//   Users
		// Resources
		//   All
		//   Module1.*
		//   Module2.function1
		//   Module2.function2
		
		// RESOURCES
		
		var ResourceList = {};
		var ResourceListFn = {};
		/*				
		// Группа доступа по-умолчанию
		me.defResource = function() {
			return [me.config.default];
		};
		
		// Регистрация модульных функций формирования списков именнованных групп ресурсов уникальных для этого модуля
		me.regResource = function(_mod, _fn) {
			if (typeof _fn === 'function') {
				ResourceListFn.push({module:_mod, func: _fn});
			}
		};
		
		// Регистрация функции возврата дефолтных ресурсов
		me.regResource(conf.name, function(){
			return [
				{id:'*', module:'Core', title:'All users'},
				{id:'@', module:'Core', title:'Registred users'},
				{id:'#', module:'Core', title:'Administrators'}
			];
		});
	
		// Обновление списка ресурсов доступа
		me.Update = function() {
			ResourceList = {};
			ResourceListFn.forEach(function(item, i, arr) {
				if (typeof(item.func) === 'function') {
					var action = item.func();
					if (typeof action === 'string') {
						action = [action];
					}
					if (Array.isArray(action)) {
						action.forEach(function(item, i, arr) {
							if (ResourceList.indexOf(item) < 0) {
								ResourceList.push(item);
							}
						});	
					}
				};
			});
		};
		*/
		
		me.Default = function(){
			return true;
		};
		
		me.Declare = function(){
			return true;
		};
		
		me.GetRights = function (ssid){
			var rights = ['*'];
			//if (App.Users.isRegistred) {rights.push('@');}
			//if (App.Users.isRegistred) {rights.push('@');}
			return rights;
		};
		
		// проверка наличия у сессии ролей с разрешенными группами
		me.Check = function (ssid, action) {
			// По ssid получае
			
			return true;
		};
		
		me.init = function(){
			log.param('    Acl:', ResourceList);
		};
		
		return me;
	};
	
	return {Required:['Users'], Module:Module};
})();