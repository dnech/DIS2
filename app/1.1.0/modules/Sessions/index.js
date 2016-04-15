/** 
 * MODULE SESSIONS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
module.exports = (function(){
	var Required = ['Logger'];	
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
		// ********** PRIVATE **********
		var sessions = {};
		
		// ********** PUBLIC **********
		/* 
			Функция публичная:
			Зачищает все существующие сесии
		*/
		me.clearAll = function () {
			sessions = {};
		};
		
		/* 
			Функция публичная:
			Зачищает все старые сессии
			Глубина от текущего времени - параметр "timeout" в конфиг файле
		*/
		me.clearOld = function () {
			var now = new Date();
			var olddate = now - me.config.timeout;
			for (var ssid in sessions) {
				if (sessions[ssid].update < olddate) {
					me.disable(ssid, 'timeout');
				}
			}
		};
		
		/* 
			Публичная Функция:
			Функция зачищает все существующие сесии
		*/
		me.list = function () {
			return sessions;
		};
		
		me.create = function () {
			var ssid = require('node-uuid').v4();
			sessions[ssid] = {active: true, data:{isAuth:false}, create: new Date(), update: new Date(), status:'created'};
			console.log('Sessions create', sessions[ssid], me.list());
			return ssid;
		};
		
        me.read = function (ssid) {
			return sessions[ssid];
		};
        
		me.update = function (ssid) {
			if (me.exist(ssid)){
				console.log('Sessions update', ssid, sessions);
				sessions[ssid].update = new Date();
				sessions[ssid].status = 'working';
			}
		};
		
        me.delete = function (ssid) {
			//if (me.exist(ssid)){
				delete(sessions[ssid]);
			//}
		};
        
		me.disable = function (ssid, status) {
			if (me.exist(ssid)){
				sessions[ssid].active = false;
				sessions[ssid].update = new Date();
				sessions[ssid].status = status || 'unknow';
				console.log('Sessions disable', ssid, sessions);
			}
		};
		
        me.exist = function (ssid) {
			return (typeof sessions[ssid] !== 'undefined' && sessions[ssid].active) ? true : false;
		};
        
		
		me.getData = function (ssid, name) {
			if (me.exist(ssid)){
				return sessions[ssid].data[name];
			} else {
				return;
			}
		};
		
		me.setData = function (ssid, name, value) {
			if (me.exist(ssid)){
				sessions[ssid].data[name] = value;
				return true;
			} else {
				return false;
			}
		};
		
		me.delData = function (ssid, name) {
			if (me.exist(ssid)){
				delete(sessions[ssid].data[name]);
				return true;
			} else {
				return false;
			}
		};
		
		// Helper for other module
		// Public Function Gate
		me.routerInit = function(req, res, url_login, url_work) {
			var ssid = req.cookies[me.config.cookie];
			if (me.exist(ssid)) {
				me.update(ssid);
				if (me.getData(ssid, 'isAuth')) {
					res.redirect(url_work);
				} else {
					res.redirect(url_login);
				}
			} else {
				var ssid = me.create();
				res.cookie(me.config.cookie, ssid);
				res.redirect(url_login);
			}
		};
		
    me.routerControl = function(req) {
			req.ssid = req.cookies[me.config.cookie];
			if (!me.exist(req.ssid)) {
				return false;
			}
			me.update(req.ssid);
			me.setData(req.ssid, 'Connect', {agent: req.headers['user-agent'], ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress)});
      return true;
		};
    
		me.routerCheck = function(req, res, next, url_init) {
			if (me.routerControl(req)) {
        return next();
      }
      res.redirect(url_init);
		};
		
    
    
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
			setInterval(me.clearOld, me.config.timeout);
		};
		
		// ********** END **********
		return me;
	}
	return {Required:Required, Module:Module};
})();