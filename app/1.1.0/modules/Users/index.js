/*  MODULE USERS */

module.exports = (function(){
	return {
		Required: ['Direct', 'Sessions'],	
		Module: function(conf){
			
			var Errors = {
				'session_not_found':       {module:conf.name, code:'501', message:'Session not found'},
				'incorrect_user_password': {module:conf.name, code:'502', message:'The username or password is incorrect'},
				'not_logged':    {module:conf.name, code:'503', message:'User is not logged'},
				'not_found':     {module:conf.name, code:'504', message:'User not found'},
			}
			
			var me = App.namespace(conf.name, conf);
			
			if (typeof Express !== 'undefined') { /* INTEGRATE MODE */
				
				
				
				
				me.loginByPass = function(login, pass, ok, err) {
					ACL.loginByPass(login, pass, ok, err);
				};
				
				me.loginBySsid = function(ssid, ok, err) {
					ACL.loginBySsid(ssid, ok, err);
				};
				
				me.logout = function(ssid, ok, err) {
					ACL.logout(ssid, ok, err);
				};
				
				me.getUserBySsid = function(ssid, ok, err) {
					ACL.getUserBySsid(ssid, ok, err);
				};
				
				
				
			} else { /* MAIN MODE */
				
				
				me.loginByPass = function(login, pass, ok, err) {
					ok();
				};
				
				me.loginBySsid = function(ssid, ok, err) {
					ok();
				};
				
				me.logout = function(ssid, ok, err) {
					ok();
				};
				
				me.getUserBySsid = function(ssid, ok, err) {
					var curSession = '';
					var curUser = '';
					var curRole = '';
					ok(curSession, curUser, curRole);
				};
				
				
			}
			
			//------------------------------------------------------------------------------------
			// User class
			function User(name, pass, isAdmin, data) {
				var me = this,
				_pass     = pass,
				_isAdmin  = (isAdmin) ? true : false,
				_data     = data || {};
				
				me.name = name;
				
				me.check = function(pass){
					return (pass === _pass);
				};
				
				me.data = function(data) {
					if (typeof data !== 'undefined') {
						_data = App.utils.extend(true, {}, _data, data);
					}
					return _data;
				};
			};
			
			//------------------------------------------------------------------------------------
			// Users
			var Users = (function() {
				var me = this,
				_list  = [];
				
				me.list = function(){
					return _list;
				};
				
				me.add = function(name, pass, isAdmin, data){
					_list.push(new User(name, pass, isAdmin, data));
				};
				
				me.get = function(name){
					for (var i = 0; i < _list.length; i++) {
						console.log('me.get', _list[i]);
						if (_list[i].name === name) {
							return _list[i];
						}
					}
					return;
				};
				
				me.delete = function(name){
				};
				
				me.load = function(){
					me.add('admin', 'admin', true,  {});
					me.add('user',  'user',  false, {});
				};
				
				me.check = function(name, pass){
					var user = me.get(name);
					if (user) {
						return user.check(pass);
					}
					return false;
				};
				
				return me;
			})();
		
			
			
			me.Login = function (ssid, user, pass) {
				if (App.Sessions.exist(ssid)){
					if (Users.check(user, pass)){
						App.Sessions.setData(ssid, 'User', user);
						App.Sessions.setData(ssid, 'isRegistred', true);
						console.log('Login', ssid, App.Sessions.list());
						return {success:true};
					} else {
						return {success:false, errors: [Errors['incorrect_user_password']]};
					}
				} else {
					return {success:false, errors: [Errors['session_not_found']]};
				}
			};
			
			me.Logout = function (ssid) {
				if (App.Sessions.exist(ssid)){
					App.Sessions.setData(ssid, 'isRegistred', false);
					//App.Sessions.delData(ssid, 'User');
					App.Sessions.disable(ssid, 'logout');
					
					console.log('Logout', ssid, App.Sessions.list());
					return {success:true};
				} else {
					return {success:false, errors: [Errors['session_not_found']]};
				}
			};
			
			me.Profile = function (ssid) {
				if (App.Sessions.exist(ssid)){
					var username = App.Sessions.getData(ssid, 'User');
					if (username) {
						var user = Users.get(username);
						if (user) {
							return {success:true, data: data};
						} else {
							return {success:false, errors: [Errors['not_found']]};
						}	
					} else {
						return {success:false, errors: [Errors['not_logged']]};
					}
				} else {
					return {success:false, errors: [Errors['session_not_found']]};
				}
			};
			
			/*
			Direct Function
			me.Delete = function(ssid, param, ok, err){
				ok({
						success: true,
						name: param,
						data: ''
					});
			};
			*/
			
			/* Direct client */
			App.Direct.On({
				Users:{
					Login:   function(ssid, param, ok, err){ok(me.Login(ssid, param.name, param.pass));},
					Logout:  function(ssid, param, ok, err){ok(me.Logout(ssid));},
					Profile: function(ssid, param, ok, err){ok(me.Profile(ssid));}
				}
			}, '*');
			
			
			/* Direct configurator */
			App.Direct.On({
				Users:{
					List:   function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});},
					Set:    function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});},
					Get:    function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});},
					Delete: function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});}
				}
			}, '#');
			
			log.param('    Users load:', '');
			
			me.init = function(){
				log.param('    Users init:', '');
				Users.load();
			};
			
			return me;
		}
	}
})();