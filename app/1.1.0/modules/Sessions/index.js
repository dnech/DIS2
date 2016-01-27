/*  MODULE Sessions */
module.exports = (function(){
	var Required = [];	
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		
		var sessions = {};
		
		me.clearAll = function () {
			sessions = {};
		};
		
		me.clearOld = function () {
			var now = new Date();
			var olddate = now - me.config.timeout;
			for (var ssid in sessions) {
				if (sessions[ssid].update < olddate) {
					me.disable(ssid, 'timeout');
				}
			}
		};
		
		me.list = function () {
			return sessions;
		};
		
		me.create = function () {
			var ssid = require('node-uuid').v4();
			sessions[ssid] = {active: true, data:{isRegistred:false}, create: new Date(), update: new Date(), status:'created'};
			console.log('Sessions create', sessions[ssid], me.list());
			return ssid;
		};
		
		me.exist = function (ssid) {
			return (typeof sessions[ssid] !== 'undefined' && sessions[ssid].active) ? true : false;
		};
		
		me.update = function (ssid) {
			if (me.exist(ssid)){
				console.log('Sessions update', ssid, sessions);
				sessions[ssid].update = new Date();
				sessions[ssid].status = 'working';
			}
		};
		
		me.disable = function (ssid, status) {
			if (me.exist(ssid)){
				sessions[ssid].active = false;
				sessions[ssid].update = new Date();
				sessions[ssid].status = status || 'unknow';
				console.log('Sessions disable', ssid, sessions);
			}
		};
		
		me.delete = function (ssid) {
			if (me.exist(ssid)){
				delete(sessions[ssid]);
			}
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
			var ssid = req.cookies['D-SSID'];
			if (me.exist(ssid)) {
				me.update(ssid);
				if (me.getData(ssid, 'isRegistred')) {
					res.redirect(url_work);
				} else {
					res.redirect(url_login);
				}
			} else {
				var ssid = me.create();
				res.cookie('D-SSID', ssid);
				res.redirect(url_login);
			}
		};
		
		me.routerCheck = function(req, res, next, url_init) {
			var ssid = req.cookies['D-SSID'];
			if (!me.exist(ssid)) {
				res.redirect(url_init);
			} else {
				me.update(ssid);
				me.setData(ssid, 'Connect', {agent: req.headers['user-agent'], ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress)});
				//console.log('SSID', {agent: req.headers['user-agent'], ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress)});
				next();
			}
		};
			
		me.init = function(){
			setInterval(me.clearOld, me.config.timeout);
		};
		
		return me;
	}
	return {Required:Required, Module:Module};
})();