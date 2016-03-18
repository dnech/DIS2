/** 
 * MODULE ACCESS 
 * @author dnech@mail.ru
 * @version 0.0.1
*/
"use strict";
module.exports = (function(){	
	var Required = ['Logger', 'Storage', 'Users'];
	var Module = function(conf){
		var me = App.namespace(conf.name, conf);
		// ********** BEGIN **********
		
		// Logger.console
		var console = App.Logger.Console(conf.name, me.config.logger);
		console.info('Load...');
		
        var async  = require('async'); 
        var Events = require('events');
        var VError = require('verror');
        
        me.Box = App.Storage.Box(conf.name, {
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
        
        /**
         * Класс работы с Ролью
         */
        me.Role = function(config) {
            
            var self = {};
            
            /**
             * Constructor 
             */
            self.config = App.utils.extend(true, {
                name: '',
                description: '',
                resources: []
            }, config);
            
            /**
             * Добавить ресурс и право на него
             */
            self.add = (name, action) => {
                if (typeof action === 'undefined') {action = true;}
                self.config.resources.push({name:name, action:action});
            };
            
            /**
             * Удалить ресурс
             */
            self.remove = (name) => {
                self.config.resources = self.config.resources.filter((value) => {
                    return (value.name != name);  
                }); 
            };
            
            /**
             * Получить объект роли
             */
            self.data = () => {
                return App.utils.extend(true, {}, self.config);
            };
            
            return self;
        };
        
        /**
         * Класс работы с Ролями
         */
		me.Roles = (() => {
            var self = {
                list: []
            };
            
            /** 
             *  Roles.Events:
             *  - load
             *  - save
             */
            self.events = new Events.EventEmitter();
            
            /**
             * Загрузить роли из файла
             */
            self.load = (cb) => {
                me.Box.get('roles', (err, data) => {
                    if (err) {
                        err = new VError(err, 'Module.%s.%s > %s', conf.name, 'Roles.load', err.name);
                        return cb(err, self.list);
                    };
                    if (!Array.isArray(data)) {
                        var err = new VError(null, 'Module.%s.%s > %s', conf.name, 'Roles.load', 'Bad data');
                        return cb(err, self.list);
                    };
                    self.list = [];
                    data.forEach((item) => {
                        self.list.push(new me.Role(item));    
                    });
                    self.events.emit('load', self.list);
                    return cb(null);
                }); 
            };
            
            /**
             * Сохранить роли в файл
             */
            self.save = (cb) => {
                var raw = [];
                self.list.forEach((item) => {
                    raw.push(item.data());    
                });
                me.Box.set('roles', raw, (err) => {
                    self.events.emit('save', err);
                    cb(err);
                });
            };
            
            return self;
        })();
        
		/**
         * Класс работы с ресурсами
         */
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
            me.Roles.load((err, data) => {
                console.param('Roles.load', data);
                
                var role = new me.Role({
                    name: 'Hello',
                    description: 'Test role' 
                });
                
                role.add('Libs.*');
                role.add('Panels.*', false);
                
                me.Roles.list.push(role);
                me.Roles.save(() => {});
                
            });
            me.Resources.update((err, data) => {
                console.param('Resource.list', data);
            });  
        });
        
		// ********** INIT **********
		me.init = function(){
			console.info('Init');
    };
        
		// ********** END **********
		return me;
	};
	return {Required:Required, Module:Module};
})();