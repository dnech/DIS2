/** 
 * MODULE CONFIGS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/  
"use strict";
module.exports = (function(){
  var Required = ['Logger'];
  var Module   = function(conf){
    var me = App.namespace(conf.name, conf);
    // ********** BEGIN **********
    
    var _       = require('lodash');
    var path    = require('path');
    
    
    // Logger.console
    var console = App.Logger.Console(conf.name, me.config.logger);
    console.info('Load...');
    
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
    
     
  
    me.Box = function(module, config){
      var B = require('./class/box');
      var _config = _.defaultsDeep(config || {}, {
        module_root: App.modules[module].Config.path,
        scheme_root: path.resolve(App.path.schema, module)
      }, me.config.default);
      return new B(module, _config);
    };
    
    /**
     *
     *  ========================= I N I T =========================
     *
     */
    me.init = function(){
      console.info('Init');
      
      var async   = require('async');
       
      var box = me.Box(conf.name, {
        path: 'data',
        ext: '.json',
        priority_scheme: true
      });
      
      if (box){
        //console.param('Box', box);
        //console.param('Box Config', box.config());
        console.config({prefix:""});        
        
        async.series([
          function(next){console.log('Test List'); box.list(next);},
          function(next){console.log('Test scheme Set'); box.set('test_scheme', 'Test scheme', next);},
          function(next){console.log('Test scheme Get'); box.get('test_scheme', next);},
          function(next){console.log('Test scheme Remove'); box.remove('test_scheme', next);},
          function(next){
            console.log('Test scheme: OK!');              
            box.config({root:true});
            console.log('Test module Set'); 
            box.set('test_module', 'Test module', next); 
          },
          function(next){console.log('Test module Get'); box.get('test_module', next);},
          function(next){console.log('Test module Remove'); box.remove('test_module', next);}
        ], function(err, data){
          if (err) {
            console.log('Test: ERROR!', err);
          } else {
            console.log('Test module: OK!');
          }
          console.config({prefix:""});
        }); 

        box.list((err, data) => {
          console.param('List', data);
        });
      }
      
    };
      
    // ********** END **********
    return me;
  };
  return {Required: Required,  Module: Module};
})();