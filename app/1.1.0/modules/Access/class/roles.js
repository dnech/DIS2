/** 
 * CLASS Roles 
 * @author dnech@mail.ru
 * @version 0.0.1
*/	


/* Class Role */
function Role(config) {
  var me = this;
  
  var _ = require('lodash');
  
  var _property = [
    {name: 'active', default: true,     rights: 'RW' }, 
    {name: 'name',   default: 'unknow', rights: 'RW' },
    {name: 'rules',  default: {},       rights: 'RW' }
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
  
 
  me.find = function(key, value) {
    return (_config[key] === value);
  };
  
  me.format = function() {
    return _config;
  };
      
};



/* Class Roles */
function Roles(module, config) {
  var me = this;
  
  var _       = require('lodash');
  var console = App.Logger.Console(module+'.Roles', config.logger);
  
  var _list = {};
  var _box  = App.Storage.Box(module, {
      path: 'roles',
      ext: '.json'
  });
   
  
  /**
   *  ========================= P R I V A T E =========================
   */
  
    
  /**
   *  ========================= P U B L I C =========================
   */
  me.clear = function() {
    _list = {};
  };
        
  me.load = function(cb) {
    me.clear();
    var list = _box.list();
    for (var key in list) {
      var data = _box.get(key);
      me.set(key, new Role(data));
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
    me.set(key, new Role(value));
  };
        
  me.remove = function(key) {
    delete(_list[key]);
  };
        
  me.find = function(field, value) {
    for (var key in _list) {
      if (_list[key].find(field, value)) {
        return _list[key];
      }
    }
    return;
  };
  
  me.Direct = function() {
    return _box.Direct;
  };
  
};

module.exports = Roles;