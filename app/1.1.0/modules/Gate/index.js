/*  MODULE GATE */

module.exports = (function(){
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		
		if (typeof Express !== 'undefined') { /* INTEGRATE MODE */
			var express	= Express;
			var server  = me.server = Express_app;
		} else { /* MAIN MODE */
			var express	= require('express');
			var server = me.server = express();
			
			//var cookieParser = require('cookie-parser');
			//var bodyParser   = require('body-parser');
			//var multer       = require('multer'); // v1.0.5
			//var upload       = multer(); // for parsing multipart/form-data
			
			server.set('port', me.config.port);
			server.use(express.cookieParser());
			//server.use(cookieParser());
			//server.use(bodyParser.json()); // for parsing application/json
			//server.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
			server.use(express.bodyParser());
			server.use(express.methodOverride());
			server.use(express.logger(me.config.logger));
			
			if(me.config.compress){
				server.use(express.compress());
			}
			//CORS (CROSS DOMAIN QUERY) Supports
			if(me.config.cors){
				server.use( function(req, res, next) {
					var ac = me.config.AccessControl;
					res.header('Access-Control-Allow-Origin', ac.AllowOrigin); // allowed hosts
					res.header('Access-Control-Allow-Methods', ac.AllowMethods); // what methods should be allowed
					res.header('Access-Control-Allow-Headers', ac.AllowHeaders); //specify headers
					res.header('Access-Control-Allow-Credentials', ac.AllowCredentials); //include cookies as part of the request if set to true
					res.header('Access-Control-Max-Age', ac.MaxAge); //prevents from requesting OPTIONS with every server-side call (value in seconds)
					if (req.method === 'OPTIONS') {
						res.send(204);
					} else { next();}
				});
			}
		}

		// Register other route
		me.route = {};
		me.regRoute = function(name, fn){
			me.route[name] = fn;
		};
		
		me.init = function(){
			try {
				for (var idx in me.route) {
					if (typeof me.route[idx] === 'function') {
						log.param('    Register route', idx);
						me.route[idx](me.server, express);
					} else {
						log.error('    Register route error', me.route[idx]);
					}
				}
				
				if (typeof Express === 'undefined') { /* MAIN MODE */
					me.server.listen(me.config.port);
					log.param('    Server running on port:', me.config.port);
				}
			} catch (err) {
				log.error('Module "'+me.name+'"', err);
			}
		};
		
		return me;
	}
	return {Required:[], Module:Module};
})();













