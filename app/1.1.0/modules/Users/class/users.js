/** 
 * CLASS Users 
 * @author dnech@mail.ru
 * @version 0.0.1
*/	

/* Class Users */
function Users(module, config) {
  var me = this;
  
  var _     = require('lodash');
  var User  = require('./user');
  var console = App.Logger.Console(module+'.Users', config.logger);
  
  var _list = {};
  var _box  = App.Storage.Box(module, {
      path: 'data',
      ext: '.usr'
  });
   
  
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
    _box.list((err, list) => {
      if (err) {return cb(err);}
      for (var key in list) {
        var data = _box.get(key);
        me.set(key, new User(data));
      };
      return cb(null, _list);
    }); 
  };
  
  me.save = function(cb) {
    var ret = true;
    _box.removeAll();
    for (var key in _list) {
      var data = _list[key].format();
      data.key = key;
      if (!_box.set(key, data)) { ret = false; }
    }
    cb(null, ret);
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
      if (_list[key][field] === value) {
        return _list[key];
      }
    }
    return;
  };
        
  me.check = function(login, pass) {
    var user = me.find('login', login);
    if (user) {
      return user.check(pass);
    }
    return false;
  };
                
};

module.exports = Users;