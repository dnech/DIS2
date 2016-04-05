/** 
 * MODULE ACCESS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
"use strict";
module.exports = (function(){	
	var Required = ['Logger', 'Storage', 'Users', 'Sessions'];
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		

    var async  = require('async'); 
    var Events = require('events');
    var VError = require('verror');
    
    var Errors = {
      'session_not_found':       {module:conf.name, code:'501', message:'Session not found'},
      'incorrect_user_password': {module:conf.name, code:'502', message:'The username or password is incorrect'},
      'not_logged':              {module:conf.name, code:'503', message:'User is not logged'},
      'not_found':               {module:conf.name, code:'504', message:'User not found'}
    }
    
    var _allRights = {};
    
    
    /**
     * Класс работы с ролями
     */
    var Roles = require('./class/roles');
    me.Roles = new Roles(conf.name, me.config);
    me.Roles.load();
    
    
		/**
     * Класс работы с ресурсами
     */
    var Resources = require('./class/resources');
    me.Resources  = new Resources(conf.name, me.config);
        
	
				
		// Регистрация функции возврата дефолтных ресурсов
		/*
        me.clearResource();
        me.regResource('Core', function(module, callback){
			callback(null, [
				{module:module, name:'*', title:'All users', description:''},
				{module:module, name:'@', title:'Registred users', description:''},
				{module:module, name:'#', title:'Administrators', description:''}
			]);
		});
        */
		
		// ********** PUBLIC **********
		
    me.updateRights = function() {
			_allRights = {};
     
      App.Users.Box.load();
      me.Roles.load();
          
      var users = App.Users.Box.list();
      for (var user in users) {
        var rights = {};
        if (!users[user].active) {
            return;
        };
        
        rights['*'] = true;
        rights['@'] = true;
        rights['#'] = users[user].isAdmin;
        
        users[user].roles.forEach((key) => {
          var role = me.Roles.get(key);
          if (typeof role === 'undefined' || !role.active) {
            return;
          };
          
          for (var key in role.rules) {
            rights[key] = (rights[key] === false) ? false : role.rules[key];           
          };
          
        });
        
        _allRights[users[user].login] = rights;
      }; 
      
      console.param('updateRights', _allRights);
      
		};
    
        /* Получить ресурс по умолчанию из конфиг файла */
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
		me.check = function (ssid, action) {
			// action for all
      if (action === '*') {
        return true;
      }
      
      // Session not found
      if (!App.Sessions.exist(ssid)){
        return false;
      }
      
      // User not logged
      if (!App.Sessions.getData(ssid, 'isAuth')) {
        return false;
      }
      
      // Not User in to session
      var login = App.Sessions.getData(ssid, 'User');
      if (typeof login === 'undefined') {
        return false;
      }
      
      return me.checkByUser(login, action);
		};
		
    
    
    
    
    me.checkByUser = function (login, action) {
      if (typeof _allRights[login] === 'undefined') {
        return false;
      }
      
      if (typeof _allRights[login][action] === 'undefined') {
        return false;
      }
      
      return _allRights[login][action]; 
		};
    
    
   
    /* Load data */
    /*
    App.Events.on('launched', () => {
      
      me.Resources.update((err, data) => {
        console.param('Resource.list', data);
      });
      
      me.Resources.update((err, data) => {
        console.param('Resource.list', data);
      });
      
    });
    */
        
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
      
      /* Update Rights */
      me.updateRights();
       
      /* Test Resources */
      me.Resources.register(conf.name, {
        module: conf.name,
        name: conf.name+'.*',
        title: conf.name+'.*',
        description: 'Module: '+conf.name+'. Data: All.'
      });
      
      me.Resources.update((err, data) => {
        //console.param('Resource.list', data);
      });   
      
      /* Test Roles */
      /*
      me.Roles.load((err, data) => {
        console.param('Roles.list', data);         
        
        if (!me.Roles.find('name', 'Test role1')) {
          
          console.param('add role', me.Roles.add({
            name: 'Test role1',
            rules: {
              'Libs.*': true,
              'Forms.*': false,
              'Panels.*': true
            }
          }));
          
          console.param('save', me.Roles.save());
        };
        
        if (!me.Roles.find('name', 'Test role2')) {
          
          console.param('add role', me.Roles.add({
            name: 'Test role2',
            rules: {
              'Libs.*': false,
              'Panels.*': false
            }
          }));
          
          console.param('save', me.Roles.save());
        };
        
      
      });
      */
      
      console.param('checkByUser user *', me.checkByUser('user', '*'));
      console.param('checkByUser user @', me.checkByUser('user', '@'));
      console.param('checkByUser user #', me.checkByUser('user', '#'));
      console.param('checkByUser user Forms.*', me.checkByUser('user', 'Forms.*'));
      console.param('checkByUser user Panels.*', me.checkByUser('user', 'Panels.*'));
      
    };
        
		// ********** END **********
		return me;
	};
	return {Required:Required, Module:Module};
})();