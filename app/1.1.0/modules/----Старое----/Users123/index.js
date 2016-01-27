/*  MODULE USERS */

module.exports = (function(){
	return {
		Required: [],	
		Module: function(conf){
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
			
			
			
			log.param('    Users load:', '');
			
			me.init = function(){
				log.param('    Users init:', '');
			};
			
			return me;
		}
	}
})();