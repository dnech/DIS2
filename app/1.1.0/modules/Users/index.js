/** 
 * MODULE USERS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/

"use strict";

module.exports = (function(){
  var Required = ['Logger', 'Storage', 'Sessions'];
  var Module   = function(conf) {
    var me = App.namespace(conf.name, conf);
    // ********** BEGIN **********
    
    // Logger.console
    var console = App.Logger.Console(conf.name, me.config.logger);
    console.info('Load...');
  
    /**
     *
     *  ========================= P R I V A T E =========================
     *
     */
  
    var Errors = {
      'session_not_found':       {module:conf.name, code:'501', message:'Session not found'},
      'incorrect_user_password': {module:conf.name, code:'502', message:'The username or password is incorrect'},
      'not_logged':              {module:conf.name, code:'503', message:'User is not logged'},
      'not_found':               {module:conf.name, code:'504', message:'User not found'}
    }
    
    //------------------------------------------------------------------------------------

    var Users = require('./class/users');
    me.Box = new Users(conf.name, me.config);
    me.Box.load();
    
    /**
     *     
     */ 
    me.count = function() {
      return Object.keys(me.Box.list()).length || 0;
    }
    
    me.get = function(login) {
      return me.Box.find('login', login);
    }
    
    /**
     *     
     */    
    me.login = function(ssid, user, pass, cb) {
      if (App.Sessions.exist(ssid)){
        if (me.Box.check(user, pass)){
          App.Sessions.setData(ssid, 'User', user);
          App.Sessions.setData(ssid, 'isAuth', true);
          console.log('Login', ssid, App.Sessions.list());
          return cb(null, true);
        } else {
          return cb([Errors['incorrect_user_password']]);
        }
      }
      return cb([Errors['session_not_found']]);
    };
    
    /**
     *     
     */     
    me.logout = function(ssid, cb) {
      if (App.Sessions.exist(ssid)){
        App.Sessions.setData(ssid, 'isAuth', false);
        //App.Sessions.delData(ssid, 'User');
        App.Sessions.disable(ssid, 'logout');
        console.log('Logout', ssid, App.Sessions.list());
        return cb(null, true);
      }
      return cb([Errors['session_not_found']]);
    };
    
    /**
     *     
     */ 
    me.isAuth = function(ssid, cb) {
      if (App.Sessions.exist(ssid)){
        return cb(null, App.Sessions.getData(ssid, 'isAuth'));
      }
      return cb([Errors['session_not_found']]);
    };
    
    /**
     *     
     */ 
    me.profile = function(ssid, cb) {
      if (App.Sessions.exist(ssid)){
        var username = App.Sessions.getData(ssid, 'User');
        if (username) {
          var user = me.Box.find('login', username);
          if (user) {
            return cb(null, data);
          } else {
            return cb([Errors['not_found']]);
          }    
        } else {
          return cb([Errors['not_logged']]);
        }
      }
      return cb([Errors['session_not_found']]);
    };
        
    
    /* Helper for Direct */
    me.directHelper = function() {
      return [
        {
          direct: {
            Users:{
              _login:   'Info: Login in exist session by login and password. Param: {login, pass}. Return: {success, errors}',
              _logout:  'Info: Logout in exist session. Param: (any) not used. Return: {success, errors}',
              _isAuth:  'Info: Check authorized. Param: (any) not used. Return: {Boolean}',
              _profile: 'Info: Get user profile. Param: (any) not used. Return: {success, data, errors}',
              login:    function(ssid, param, callback){me.login(ssid, param.login, param.pass, callback);},
              logout:   function(ssid, param, callback){me.logout(ssid, callback);},
              isAuth:   function(ssid, param, callback){me.isAuth(ssid, callback);},
              profile:  function(ssid, param, callback){me.profile(ssid, callback);}
            }
          },
          rights: '*'
        },
        {
          direct: {
            Users: {
              Box: me.Box.Direct()
            }
          },
          rights: '#'
        },
      ];
    };
    
    
    /* Direct client */
    /*
    App.Direct.on({
      Users:{
        _login:   'Info: Login in exist session by login and password. Param: {login, pass}. Return: {success, errors}',
        _logout:  'Info: Logout in exist session. Param: (any) not used. Return: {success, errors}',
        _isAuth:  'Info: Check authorized. Param: (any) not used. Return: {Boolean}',
        _profile: 'Info: Get user profile. Param: (any) not used. Return: {success, data, errors}',
        login:    function(ssid, param, callback){me.login(ssid, param.login, param.pass, callback);},
        logout:   function(ssid, param, callback){me.logout(ssid, callback);},
        isAuth:   function(ssid, param, callback){me.isAuth(ssid, callback);},
        profile:  function(ssid, param, callback){me.profile(ssid, callback);}
      }
    }, '*');
    */        
    /* Direct configurator */
    /*
    App.Direct.on({
      Users: {
        Box: me.Users.Direct()
      }  
    }, '#');
    */
    

    // ********** INIT **********
    me.init = function(){
      console.info('Init');
      console.config({prefix:""});
     
      /*
      me.Box.load((err, data) => {
        console.param('Users.list', data);
        
        
       // var save = false;
      
       for (var item in data) {
          /*
          data[item].active = false;
          data[item].pass   = 'falsefalse';
          data[item].admin  = false;
          data[item].data   = {hello1:'h1'};
          data[item].data   = {hello2:'h2'};
          data[item].data   = {hello1:'h3'};
          
          console.param('active', data[item].active);
          console.param('login',  data[item].login);
          console.param('pass',   data[item].pass);
          console.param('admin',  data[item].admin);
          console.param('data',   data[item].data);
          
          console.param('format',   data[item].format());
        };
        */
        /*
        
        if (!me.Box.find('login', 'admin')) {
          console.param('add admin', me.Box.add({login:'admin', pass:'admin', isAdmin: true, data:{}}));
          save = true;
        };
        
        if (!me.Box.find('login', 'user')) {
          console.param('add user', me.Box.add({login:'user', pass:'user', isAdmin: false, data:{}}));
          save = true;
        };
        
        if (save) {
          console.param('save', me.Box.save());
        }
        
      });
      */
    };
            
    // ********** END **********
    return me;
  };
  return {Required: Required, Module: Module};
})();