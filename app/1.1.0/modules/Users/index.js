/** 
 * MODULE USERS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/

"use strict";

module.exports = (function(){
  var Required = ['Storage', 'Direct', 'Sessions'];
  var Module   = function(conf){
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
            'not_logged':    {module:conf.name, code:'503', message:'User is not logged'},
            'not_found':     {module:conf.name, code:'504', message:'User not found'},
        }
    
    //------------------------------------------------------------------------------------

    var Users = require('./class/users');
    
    //------------------------------------------------------------------------------------
        // Users

     
    me.Users = new Users(conf.name, me.config);
    //me.Users.load((err, data) => {});
    
  /*
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
    */            

            
        
        
            
            
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
            App.Direct.on({
                Users:{
                    Login:   function(ssid, param, ok, err){ok(me.Login(ssid, param.name, param.pass));},
                    Logout:  function(ssid, param, ok, err){ok(me.Logout(ssid));},
                    Profile: function(ssid, param, ok, err){ok(me.Profile(ssid));}
                }
            }, '*');
            
            
            /* Direct configurator */
            App.Direct.on({
                Users:{
                    List:   function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});},
                    Set:    function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});},
                    Get:    function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});},
                    Delete: function(ssid, param, ok, err){ok({success:false, errors: [Errors['session']]});}
                }
            }, '#');


        // ********** INIT **********
        me.init = function(){
            console.info('Init');
            console.config({prefix:""});
      
        me.Users.load((err, data) => {
          
          console.param('************************', err, data);
          
          if (!me.Users.find('login', 'admin')) {
            console.param('add admin', err, data);
            me.Users.add({login:'admin', pass:'admin', admin: true, data:{}});
          };
          
          if (!me.Users.find('login', 'user')) {
            console.param('add user', err, data);
            me.Users.add({login:'user', pass:'user', admin: false, data:{}});
          };
          
          me.Users.save((err, data) => {
            console.param('save', err, data);
          });
        
        });
      };
            
        // ********** END **********
        return me;
    };
    return {Required: Required,    Module: Module};
})();