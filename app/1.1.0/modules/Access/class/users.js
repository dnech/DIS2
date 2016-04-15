/** 
 * CLASS Users 
 * @author dnech@mail.ru
 * @version 0.0.1
*/	



/* Class User */
function User(config) {
  var me = this;
  
  var _ = require('lodash');
  
  var _property = [
    {name: 'active',  default: true,     rights: 'RW' }, 
    {name: 'login',   default: 'unknow', rights: 'R'  },
    {name: 'pass',    default: 'unknow', rights: 'W'  },
    {name: 'isAdmin', default: false,    rights: 'RW' },
    {name: 'roles',   default: [],       rights: 'RW' },
    {name: 'data',    default: {},       rights: 'RW', set: function(newValue, oldValue) { return _.defaultsDeep({}, newValue, oldValue);}}
  ]
  
  /**
   *  ========================= P R I V A T E =========================
   */

  var _default = {};
  
  _property.forEach((item) => {
    /* Default pre value set function */
    item.set = item.set || function(newValue, oldValue) {
      return newValue;
    };
    
    /* Default pre value get function */
    item.get = item.get || function(value) {
      return value;
    };
    
    _default[item.name] = item.default;  
    
    if (item.rights === 'R' || item.rights === 'RW'){
      me.__defineGetter__(item.name, function(){
        return item.get(_config[item.name]);
      });
    };
    
    if (item.rights === 'W' || item.rights === 'RW'){
      me.__defineSetter__(item.name, function(value){
        _config[item.name] = item.set(value, _config[item.name]);
      });
    };

  });
  
  var _config = _.defaultsDeep({}, config, _default);
  
  
  /**
   *  ========================= P U B L I C =========================
   */
  
  me.check = function(key, value) {
    return (_config[key] === value);
  };
  
  me.format = function() {
    return _config;
  };
      
};






/* Class Users */
function Users(module, config) {
  var me = this;
  
  var _       = require('lodash');
  var console = App.Logger.Console(module+'.Users', config.logger);
  
  var _list = {};
  var _box  = App.Storage.Box(module, {
      path: 'users',
      ext: '.json'
  });
   
  
  var Errors = {
    'session_not_found':       {module:module+'.Users',code:'501',message:'Session not found'},
    'incorrect_user_password': {module:module+'.Users',code:'502',message:'The username or password is incorrect'},
    'not_logged':              {module:module+'.Users',code:'503',message:'User is not logged'},
    'not_found':               {module:module+'.Users',code:'504',message:'User not found'}
  };
    
  /**
   *
   *  ========================= P R I V A T E =========================
   *
   */
  
    
  /**
   *
   *  ========================= P U B L I C =========================
   *
   */
  me.clear = function() {
    _list = {};
  };
        
  me.load = function(cb) {
    me.clear();
    var list = _box.list();
    for (var key in list) {
      var data = _box.get(key);
      me.set(key, new User(data));
    };
    if (typeof cb === 'undefined') {
      return _list;
    } else {
      return cb(null, _list);
    }
  };
  
  me.save = function(cb) {
    var ret = true;
    _box.removeAll();
    for (var key in _list) {
      var data = _list[key].format();
      data.key = key;
      if (!_box.set(key, data)) { ret = false; }
    }
    if (typeof cb === 'undefined') {
      return ret;
    } else {
      return cb(null, ret);
    }
  };
                
  me.list = function() {
    return _list;
  };
        
  me.get = function(key) {
    return _list[key];
  };
        
  me.set = function(key, value) {
    _list[key] = value;
    _list[key].key = key;
  };
        
  me.add = function(value) {
    var key = require('node-uuid').v4();
    me.set(key, new User(value));
  };
        
  me.remove = function(key) {
    delete(_list[key]);
  };
        
  me.find = function(field, value) {
    for (var key in _list) {
      if (_list[key].check(field, value)) {
        return _list[key];
      }
    }
    return;
  };
        
  me.check = function(login, pass) {
    var user = me.find('login', login);
    if (user) {
      return user.check('pass', pass);
    }
    return false;
  };
  
  me.count = function() {
    return Object.keys(me._box.list()).length || 0;
  }
      
  /**
    *     
    */    
  me.login = function(ssid, user, pass, cb) {
    if (App.Sessions.exist(ssid)){
      if (me.check(user, pass)){
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
    return {
      Users: {
        _login:   'Info: Login in exist session by login and password. Param: {login, pass}. Return: {success, errors}',
        _logout:  'Info: Logout in exist session. Param: (any) not used. Return: {success, errors}',
        _isAuth:  'Info: Check authorized. Param: (any) not used. Return: {Boolean}',
        _profile: 'Info: Get user profile. Param: (any) not used. Return: {success, data, errors}',
        login:    function(ssid, param, callback){me.login(ssid, param.login, param.pass, callback);},
        logout:   function(ssid, param, callback){me.logout(ssid, callback);},
        isAuth:   function(ssid, param, callback){me.isAuth(ssid, callback);},
        profile:  function(ssid, param, callback){me.profile(ssid, callback);}
      },
      AdminArea: {
        Users: _box.Direct
      }
    };
  };
  
  
};

module.exports = Users;