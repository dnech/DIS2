/** 
 * CLASS Console 
 * @author dnech@mail.ru
 * @version 0.0.1
*/	
var _    = require('lodash');
var util = require('util');

/* Class Console */
function Console(moduleName, config) {
  var me = this;
  
  /**
   *
   *  ========================= P R I V A T E =========================
   *
   */

  var _moduleName = moduleName;
  var _config     = _.defaultsDeep({}, config || {}, {
		enable:         true,
		show: {
      date:         false,
      time:         false,
      milliseconds: false,
      type:         true,
      modulename:   true
    },
		prefix:         '',
		color:          true,
		level:          0,
		deftype:        'trace',
		type: {
			trace:   {level: 0, color: '1',       name: '[trace] '  }, 
			debug:   {level: 1, color: '1;36',    name: '[debug] '  }, 
			info:    {level: 2, color: '1;32',    name: '[info] '   }, 
			warning: {level: 3, color: '1;33',    name: '[warning] '},
			error:   {level: 4, color: '1;31',    name: '[error] '  },
			fatal:   {level: 5, color: '1;31;41', name: '[fatal] '  },
			log:     {level: 2, color: '1',       name: '[log] '    }
		}
  });
  
  /**
   * TimeStamp
   * Return formated string current timestamp
   */
  function timestamp(show_date, show_time, show_milliseconds) {
    var ts_ = new Date(),
      dy = ('0'+ts_.getDate()).substr(-2),          //  Set the day as a number (1-31)
      yy = ts_.getFullYear(),                       //  Set the year (optionally month and day)
      hr = ('0'+ts_.getHours()).substr(-2),         //  Set the hour (0-23)
      ms = ('00'+ts_.getMilliseconds()).substr(-3), //  Set the milliseconds (0-999)
      mi = ('0'+ts_.getMinutes()).substr(-2),       //  Set the minutes (0-59)
      mo = ('0'+(ts_.getMonth()+1)).substr(-2),     //  Set the month (0-11)
      sc = ('0'+ts_.getSeconds()).substr(-2),       //  Set the seconds (0-59)
      tm = ts_.getTime();                           //  Set the time (milliseconds since January 1, 1970)
      
    var _dt = '', _tm = '', _ms = '';  
    if (show_date) {_dt = yy+'.'+mo+'.'+dy;}
    if (show_time) {_tm = hr+':'+mi+':'+sc;}
    if (show_milliseconds) {_ms = '.'+ms;}
  
    return '['+_dt+((show_date && show_time)?' ':'')+_tm+_ms+']';
  }
  
  // Calc Title
  function calcTitle(param) {
    var ts = (_config.show.date || _config.show.time || _config.show.milliseconds) ?  me.color('33', timestamp(_config.show.date, _config.show.time, _config.show.milliseconds))+' ' : '';
    var tp = (_config.show.type) ? me.color(param.color, param.name) : '';
    return _config.prefix+ts+tp;
  };
  
  // time timeEnd
  function time(name, begin) {
    if (_config.enable){
      var param = _config.type['trace'],
        md = (_config.show.modulename) ?  me.color('2;32', _moduleName+': ') : ' ';
      if ( param.level >= _config.level ) {
        var title = md+name;
        if (begin) {
          console.time(title);
        } else {
          process.stdout.write(calcTitle(param));
          console.timeEnd(title);
        }
      }
    }
  };
  
  /**
   *
   *  ========================= P U B L I C =========================
   *
   */
  
  me.config = function(config) {
    _config = _.defaultsDeep({}, config, _config);
  };
  
  // Color
  me.color = function(cod, str) {
    if (_config.color) {
      return '\033['+cod+'m'+str+'\033[0m';
    }
    return str;
  };
  
  // Logger
  me.logger = function(type, arg) {
    if (_config.enable){
      var param = _config.type[type] || _config.type['trace'];
      var md = (_config.show.modulename) ?  me.color('2;32', _moduleName+':') : '';
      
      if ( param.level >= _config.level ) {
        var args  = [calcTitle(param)+md];
        for (var i = 0; i < arg.length; i++) {args.push(arg[i]);}
        console.log.apply(this, args);
      }
    }
  };
  
  me.time = function(name) {
    time(name, true);
  };
  
  me.timeEnd = function(name) {
    time(name, false);
  };
  
  me.param = function() {
    var arg = arguments;
    arg[0] = me.color('1;33', arg[0]);
    for (var i = 1; i < arg.length; i++) {
      arg[i] = me.color('1;33', '{'+(typeof arg[i])+'} => ')+me.color('1;32', util.inspect(arg[i]));
    }
    me.logger(_config.deftype, arg);
  };
    
    
  for (var key in _config.type) {
    me[key] = (function(key){
      return function(){
        me.logger(key, arguments);
      }
    })(key);
  };
  
};

module.exports = Console;