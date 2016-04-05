/** 
 * CLASS Resources 
 * @author dnech@mail.ru
 * @version 0.0.1
*/

/* Class Resources */
function Resources(module, config) {
  var me = this;
  
  var _      = require('lodash');
  var async  = require('async'); 
  var Events = require('events');
  
  var _listRes = [];
  var _listFn  = [];
  
  var console = App.Logger.Console(module+'.Resources', config.logger);
    

  /**
   *  ========================= P U B L I C =========================
   */
  
  /** 
   *  Resources.Events:
   *  - register
   *  - unregister
   *  - update
   */
  me.events = new Events.EventEmitter();
            
  /**
   * Список всех ресурсов
   */
  me.list = () => {
    return _listRes;
  }; 
  
  /**
   * Добавление функций формирования списка ресурсов
   */            
  me.register = (module, data) => {
    var func;
    
    if (typeof data === 'object') {
      func = (cb) => {
        cb(null, [data]); 
      };
    }
    
    if (Array.isArray(data)) {
      func = (cb) => {
        cb(null, data); 
      };
    }
    
    if (typeof data === 'function') {
      func = data;
    }
    
    if (func) {
      _listFn.push({module:module, func: func});
      me.events.emit('register', module);
    }
  };
  
  /**
   * Удаление функций формирования списка ресурсов
   */ 
  me.unregister = (module) => {
    _listFn = _listFn.filter((value) => {
      return (value.module != module);  
    });
    me.events.emit('unregister', module);
  };
            
  /**
   * Выполнение функций для формирования списка ресурсов
   */
  me.update = (cb) => {
    _listRes = [];
    var arr = [];
    _listFn.forEach((item) => {
      if (typeof(item.func) === 'function') {
        arr.push((cb) => {item.func(cb);});
      }    
    });

    async.parallel(arr, (err, data) => {
      if (err) {
        console.error('Resource.update:', err);
        return cb(err, _listRes);
      }
      data.forEach((res) => {
        res.forEach((item) => {
          if (!_listRes.some((value)=>{return (value.name === item.name);})) {
            _listRes.push(item);
          }
        });
      });
      me.events.emit('update');
      cb(null, _listRes);                
    });    
  };  
};

module.exports = Resources;