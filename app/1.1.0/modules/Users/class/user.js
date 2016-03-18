/** 
 * CLASS User 
 * @author dnech@mail.ru
 * @version 0.0.1
*/	

/* Class User */
function User(config) {
  var me = this;
  
  var _ = require('lodash');
  var _config = _.defaultsDeep({}, config, {
      active: true,
      login: 'unknow',
      pass: 'unknow',
      admin: false,
      data: {}
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
  
  me.check = function(pass) {
    return (pass === _config.pass);
  };
  
  me.data = function(value) {
    if (typeof value === 'undefined') {
      return _config.data;
    };      
    
    _config.data = _.defaultsDeep({}, value, _config.data);
    return _config.data;
  };  
  
  me.format = function() {
    return _config;
  };
      
};

module.exports = User;