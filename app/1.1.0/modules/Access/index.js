/** 
 * MODULE ACCESS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
module.exports = (function(){	
	var Required = ['Logger', 'Users'];
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
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
		
		// ********** PRIVATE **********
		
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
		
		// ********** PUBLIC **********
		
		me.Default = function(){
			return [me.config.default];
		};
		
		me.Declare = function(acl){
			if (typeof acl === 'string') {
				acl = [acl];
			}
			return acl;
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
		
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
			console.param('Acl', ResourceList);
		};
		
		// ********** END **********
		return me;
	};
	return {Required:Required, Module:Module};
})();