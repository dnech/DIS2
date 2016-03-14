/** 
 * MODULE ACCESS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
'use strict';
module.exports = (function(){	
	var Required = ['Logger', 'Users', 'Configs'];
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
        var async  = require('async'); 
        var Events = require('events');
        
        me.Box = App.Configs.Box(conf.name, {
            path: 'data',
            ext: '.json',
            priority_scheme: true
        });

		// Users:
		//   Admin
		//   Manager
		//   User
		// Roles:
		//   Administrators
		//   Managers
		//   Users
		// Resources
		//   All
		//   Module1.*
		//   Module2.function1
		//   Module2.function2		
		// RESOURCES
        
        me.Role = (config) => {
            var self = {};
            
            self.config = App.utils.extend(true, {
                name: '',
                description: '',
                resources: []
            }, config);
            
            self.add = (name, action) => {
                self.config.resources.push({name:name, action:action});
            };
            
            self.remove = (name) => {
                self.config.resources = self.config.resources.filter((value) => {
                    return (value.name != name);  
                }); 
            };
            
            return self;
        };
        
		me.Roles = (() => {
            var list = [];
            
            //box.set('LibsFull', { name: 'Libs - Полный доступ', resources:[{name:'Libs.*', action:true}]}, (err) => {});
            //box.set('PanelsFull', { name: 'Panels - Полный доступ', resources:[{name:'Panels.*', action:true}]}, (err) => {});
            
            var self = {};
            
            self.load = (cb) => {
                me.Box.get('roles', (err, data) => {
                    if (err) {return cb(err);}
                    var raw = data;
                    // ... to list
                }); 
            }
            
            self.save = (cb) => {
                var raw = {};
                // ... from list
                me.Box.set('roles', raw, cb);
            }
            
            return self;
        })();
        
		// ********** PRIVATE **********
		me.Resources = (function() {
            var listRes = [];
            var listFn  = [];
           
            var self = {};
            
            /** 
             *  Resources.Events:
             *  - register
             *  - unregister
             *  - update
             */
            self.events = new Events.EventEmitter();
            
            /**
             * Список всех ресурсов
             */
            self.list = () => {
                return listRes;
            };
            
            /**
             * Добавление функций формирования списка ресурсов
             */            
            self.register = (module, data) => {
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
                    listFn.push({module:module, func: func});
                    self.events.emit('register', module);
                }
                
            };
            
            /**
             * Удаление функций формирования списка ресурсов
             */ 
            self.unregister = (module) => {
                listFn = listFn.filter((value) => {
                    return (value.module != module);  
                });
                self.events.emit('unregister', module);
            };
            
            /**
             * Выполнение функций для формирования списка ресурсов
             */
            self.update = (cb) => {
                listRes = [];
                var arr = [];
                listFn.forEach((item) => {
                    if (typeof(item.func) === 'function') {
                        arr.push((cb) => {item.func(cb);});
                    }    
                });
                    
                async.parallel(arr, (err, data) => {
                    if (err) {
                        console.error('Resource.update:', err);
                        return cb(err, listRes);
                    }
                    data.forEach((res) => {
                        res.forEach((item) => {
                            if (!listRes.some((value)=>{return (value.name === item.name);})) {
                                listRes.push(item);
                            }
                        });
                    });
                    self.events.emit('update');
                    cb(null, listRes);                
                });    
            };
            
            return self;
        })();
        
	
				
		// Регистрация функции возврата дефолтных ресурсов
		/*
        me.clearResource();
        me.regResource('Core', function(module, callback){
			callback(null, [
				{module:module, name:'*', title:'All users', description:''},
				{module:module, name:'@', title:'Registred users', description:''},
				{module:module, name:'#', title:'Administrators', description:''}
			]);
		});
        */
		
		// ********** PUBLIC **********
		
        /* Получить ресурс по умолчанию из конфиг файла */
		me.Default = function(){
			return [me.config.default];
		};
		
		me.Declare = function(acl){
			if (typeof acl === 'string') {
				acl = [acl];
			}
			return acl;
		};
		
		me.GetRights = function (ssid){
			var rights = ['*'];
			//if (App.Users.isRegistred) {rights.push('@');}
			//if (App.Users.isRegistred) {rights.push('@');}
			return rights;
		};
		
		// проверка наличия у сессии ролей с разрешенными группами
		me.Check = function (ssid, action) {
			// По ssid получае
			return true;
		};
		
        App.Events.on('launched', () => {
            me.Resources.update(() => {
                console.param('Resource.list', me.Resources.list());
            });  
        });
        
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
            
            me.Roles
		};
		
		// ********** END **********
		return me;
	};
	return {Required:Required, Module:Module};
})();