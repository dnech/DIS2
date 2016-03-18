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
        return concat('scheme', data.scheme, 'system', data.module);
      } else {
        return concat('system', data.module, 'scheme', data.scheme);
      }
    } else {
      /* Async */
      async.parallel({
          module: function(cb){_config.module_storage.list(cb)},
          scheme: function(cb){_config.scheme_storage.list(cb)}
      }, function(err, data){
        if (_config.priority_scheme){
          if (typeof callback === 'function') callback(null, concat('scheme', data.scheme, 'system', data.module));
        } else {
          if (typeof callback === 'function') callback(null, concat('system', data.module, 'scheme', data.scheme));
        }
      });
    }
  };
  
  /**/
  me.get = function(name, callback) {
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
        if (typeof callback === 'function') {
          callback(null, (_config.priority_scheme) ? (data.scheme || data.module) : (data.module || data.scheme));
        }
    });
  };
  
  /**/
  me.set = function(name, value, callback) {
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
      if (typeof callback === 'function') {
        callback(!(data.module || data.scheme));
      }
    });
  };
  
  /**/
  me.remove = function(name, callback) {
    async.parallel({
      module: function(cb) {
        if (!_config.root) {return cb(null, false)};
        _config.module_storage.remove(name, cb);
      },
      scheme: function(cb) {
        _config.scheme_storage.remove(name, cb);
      }
    }, function(err, data) {
      if (typeof callback === 'function') {
        callback(!(data.module || data.scheme));
      }
    });
  };
  
  /**/  
  me.removeAll = function(name, callback) {
    async.parallel({
      module: function(cb){
        if (!_config.root) {return cb(null, false)};
        cb(null, _config.module_storage.removeAll());
      },
      scheme: function(cb){
        cb(null, _config.scheme_storage.removeAll());
      }
    }, function(err, data){
      if (typeof callback === 'function') {
        callback(!(data.module || data.scheme));
      }
    });
  };
  
  /**/  
  me.Direct = {
    _List:     'Info: Get a list of files. Param: (any) not used. Return: array of information about the files',
    _Get:      'Info: Get the contents of the file. Param: name. Return: file contents',
    _Set:      'Info: Set the contents of the file. Param: {name, data}. Return: true',
    _Remove:   'Info: Remove a file. Param: name. Return: true',
    List:      function(ssid, param, callback) {me.list(callback);},
    Get:       function(ssid, param, callback) {me.get(param, callback);},
    Set:       function(ssid, param, callback) {me.set(param.name, param.data, callback);},
    Remove:    function(ssid, param, callback) {me.remove(param, callback);},
    RemoveAll: function(ssid, param, callback) {me.removeAll(callback);}
  };
   
  // Init 
  me.config(config); 
};

module.exports = Box;