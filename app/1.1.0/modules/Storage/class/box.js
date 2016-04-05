/** 
 * CLASS Box 
 * @author dnech@mail.ru
 * @version 0.0.1
*/	

/* Class Console */
function Box(moduleName, config) {
  var me = this;
  
  var _       = require('lodash');
  var async   = require('async');
  var fs      = require('fs');
  var path    = require('path');
  var Storage = require('storage');

  /**
   *
   *  ========================= P R I V A T E =========================
   *
   */

  var _moduleName = moduleName;
  var _config     = {};
  
  // Проверка существования папки или файла
  function exist(df){
    try {
      fs.accessSync(df, fs.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  };
  

  /**/
  function _set(type, name, value, callback) {
    
    if (type === 'create' || type === 'update') {
      var oldValue = me.get(name);
      
      if ((typeof oldValue != 'undefined') && (type === 'create')) {
        if (typeof callback === 'undefined') {
          callback(new Error('Record is exist.'));
        }
        return;
      }
      
      if ((typeof oldValue === 'undefined') && (type === 'update')) {
        if (typeof callback === 'undefined') {
          callback(new Error('Record not found.'));
        }
        return;
      }
    }
    
    if (typeof callback === 'undefined') {
      /* Sync */
      var module;
      var scheme;
      if (_config.root) {
        if (!exist(_config.module_data)){fs.mkdirSync(_config.module_data);} 
        module = _config.module_storage.set(name, value);
      } else {
        if (!exist(_config.scheme_root)){fs.mkdirSync(_config.scheme_root);}
        if (!exist(_config.scheme_data)){fs.mkdirSync(_config.scheme_data);}
        scheme = _config.scheme_storage.set(name, value);
      }
      return (module || scheme);
    } else {
      /* Async */  
      async.parallel({
        module: function(cb) {
          if (!_config.root) {return cb(null, false)};
          if (!exist(_config.module_data)){fs.mkdirSync(_config.module_data);} 
          _config.module_storage.set(name, value, cb);
        },
        scheme: function(cb) {
          if (_config.root) {return cb(null, false)};
          if (!exist(_config.scheme_root)){fs.mkdirSync(_config.scheme_root);}
          if (!exist(_config.scheme_data)){fs.mkdirSync(_config.scheme_data);}
          _config.scheme_storage.set(name, value, cb);
        }
      }, function(err, data) {
        callback(!(data.module || data.scheme)); 
      });
    }
  };
  
  /**
   *
   *  ========================= P U B L I C =========================
   *
   */
  
  /**/
  me.config = function(config) {
    _config = _.defaultsDeep({}, config, _config, {
      path: 'data',
      ext: '.json',
      root: false,
      priority_scheme: false
    });
    _config.module_data = path.resolve(_config.module_root, _config.path);
    _config.scheme_data = path.resolve(_config.scheme_root, _config.path);
    _config.module_storage = new Storage(_config.module_data, {
      ext: _config.ext,
    });  
    _config.scheme_storage = new Storage(_config.scheme_data, {
      ext: _config.ext,
    }); 
    return _config;
  };
    
  /**/  
  me.list = function(callback) {
    
    function concat(type1, arr1, type2, arr2){
      var arr = {};
      arr1.sort();
      arr1.forEach((item) => {
        arr[item] = {type: type1};
      });
      arr2.sort();
      arr2.forEach(function(item) {
        if (typeof(arr[item]) === 'undefined') {
          arr[item] = {type: type2};
        }
      });
      return arr;
    };
    
    if (typeof callback === 'undefined') {
      /* Sync */
      var module = _config.module_storage.list();
      var scheme = _config.scheme_storage.list();
      if (_config.priority_scheme){
        return concat('scheme', scheme, 'system', module);
      } else {
        return concat('system', module, 'scheme', scheme);
      }
    } else {
      /* Async */
      async.parallel({
          module: function(cb){_config.module_storage.list(cb)},
          scheme: function(cb){_config.scheme_storage.list(cb)}
      }, function(err, data){
        if (_config.priority_scheme){
          callback(null, concat('scheme', data.scheme, 'system', data.module));
        } else {
          callback(null, concat('system', data.module, 'scheme', data.scheme));
        }
      });
    }
  };
  
  /**/
  me.set = function(name, value, callback) {
    return _set('set', name, value, callback);
  };
  
  /**/
  me.create = function(name, value, callback) {
    return _set('create', name, value, callback);
  };
  
  /**/
  me.update = function(name, value, callback) {
    return _set('update', name, value, callback);
  };
  
  /**/
  me.read = me.get = function(name, callback) {
    if (typeof callback === 'undefined') {
      /* Sync */
      var module = _config.module_storage.get(name);
      var scheme = _config.scheme_storage.get(name);
      if (!scheme && !module) {
        return;
      }  
      return (_config.priority_scheme) ? (scheme || module) : (module || scheme);
    } else {
      /* Async */
      async.parallel({
        module: function(cb){
          _config.module_storage.get(name, cb);
        },
        scheme: function(cb){
          _config.scheme_storage.get(name, cb); 
        }
      }, function(err, data){
        if (!data.scheme && !data.module) {
          if (typeof callback === 'function') {
            callback('not found');
          } 
          return;
        }
        callback(null, (_config.priority_scheme) ? (data.scheme || data.module) : (data.module || data.scheme));
      });
    }
  };
  
  /**/
  me.delete = me.remove = function(name, callback) {
    if (typeof callback === 'undefined') {
      /* Sync */
      var module;
      var scheme;
      if (_config.root) {
        module = _config.module_storage.remove(name);
      }
      scheme = _config.scheme_storage.remove(name); 
      return (module || scheme);
    } else {
      /* Async */    
      async.parallel({
        module: function(cb) {
          if (!_config.root) {return cb(null, false)};
          _config.module_storage.remove(name, cb);
        },
        scheme: function(cb) {
          _config.scheme_storage.remove(name, cb);
        }
      }, function(err, data) {
        callback(!(data.module || data.scheme));
      });
    }
  };
  
  /**/  
  me.removeAll = function(name, callback) {
    if (typeof callback === 'undefined') {
      /* Sync */
      var module;
      var scheme;
      if (_config.root) {
        module = _config.module_storage.removeAll();
      }
      scheme = _config.scheme_storage.removeAll();
      return (module || scheme);
    } else {
      /* Async */  
      async.parallel({
        module: function(cb){
          if (!_config.root) {return cb(null, false)};
          cb(null, _config.module_storage.removeAll());
        },
        scheme: function(cb){
          cb(null, _config.scheme_storage.removeAll());
        }
      }, function(err, data){
        callback(!(data.module || data.scheme));
      });
    }
  };
  
  /**/  
  me.Direct = {
    _list:     'Info: Get a list of files. Param: (any) not used. Return: array of information about the files',
    _create:   'Info: Create the contents of the file. Param: {name, data}. Return: true',
    _read:     'Info: Read the contents of the file. Param: name. Return: file contents',
    _update:   'Info: Update the contents of the file. Param: {name, data}. Return: true',
    _delete:   'Info: Remove a file. Param: name. Return: true',
    _get:      'Info: Get the contents of the file. Param: name. Return: file contents',
    _set:      'Info: Set the contents of the file. Param: {name, data}. Return: true',
    _remove:   'Info: Remove a file. Param: name. Return: true',
    _removeAll:'Info: Remove all files. Param: (any) not used. Return: true',
    list:      function(ssid, param, callback) {me.list(callback);},
    create:    function(ssid, param, callback) {me.create(param.name, param.data, callback);},
    read:      function(ssid, param, callback) {me.read(param, callback);},
    update:    function(ssid, param, callback) {me.update(param.name, param.data, callback);},
    delete:    function(ssid, param, callback) {me.delete(param, callback);},
    get:       function(ssid, param, callback) {me.get(param, callback);},
    set:       function(ssid, param, callback) {me.set(param.name, param.data, callback);},
    remove:    function(ssid, param, callback) {me.remove(param, callback);},
    removeAll: function(ssid, param, callback) {me.removeAll(callback);}
  };
   
  // Init 
  me.config(config); 
};

module.exports = Box;