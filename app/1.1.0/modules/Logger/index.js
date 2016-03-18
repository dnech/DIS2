/** 
 * MODULE LOGGER 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
"use strict";
module.exports = (function(){
	var Required = [];
	var Module   = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
    
		var _       = require('lodash');
		var util    = require('util');
    
		/**
     *
     *  ========================= P R I V A T E =========================
     *
     */
		
		// ... 
		
		/**
     *
     *  ========================= P U B L I C =========================
     *
     */

		me.Console = function(module, config){
			var c = require('./console');
      var _config = _.defaultsDeep({}, config || {}, me.config.default);
      return new c(module, _config);
		};
	
		
		/**
     *
     *  ========================= I N I T =========================
     *
     */
		me.init = function(){
      // test
      var console = me.Console('Logger', me.config.logger);
      console.info('Init');
      console.time('Time');
			console.trace('Test trace message.');
			console.debug('Test debug message.');
			console.info('Test info message.');
			console.warning('Test warning message.');
			console.error('Test error message.');
			console.fatal('Test fatal message.');
			console.param('Name', [123, {test:123}], 'String');
			console.timeEnd('Time');
		};
		
		// ********** END **********
		return me;
	};
	return {Required: Required, Module: Module};
})();