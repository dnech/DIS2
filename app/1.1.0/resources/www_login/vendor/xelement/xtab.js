(function($){
xEl = (typeof xEl === 'object') ? xEl : {};
xEl.xTabs = function(tabs){
    if (typeof tabs.data('tabs') === 'undefined') {
        var counter = 0;
        var me = $({});
        var ismoved = true;
        /* ПРИВАТНЫЕ ФУНКЦИИ */
        /* Назначить вкладке обработчики */
        var setClick = function(tab){
            if (typeof tab !== 'undefined') {
                tab.title.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    me.active(me.findById($(this).attr('data-tab')));
                    return false;
                });
                tab.close.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    me.remove(me.findById($(this).parents('li').attr('data-tab')));
                    return false;
                });
            }    
        };
        
        var clearActive = function(tab, forcibly){
            tab = tab || me.findByIndex(0);
            if (!tab) {return false;}
            if (tab.title.hasClass('active') || (typeof me.active() === 'undefined')) {
                if (forcibly || tab.title.hasClass('xtab_disable') || (tab.title.css('display') === 'none')){
                    var i, newtab;
                    var pos = tab.index();
                    for (i = pos+1; i<me.count() ;i++) {
                        newtab = me.findByIndex(i);
                        if (!newtab.title.hasClass('xtab_disable')){
                            newtab.active();
                            return true;
                        }
                    }
                    for (i = pos-1; i>-1; i--) {
                        newtab = me.findByIndex(i);
                        if (!newtab.title.hasClass('xtab_disable')){
                            newtab.active();
                            return true;
                        }
                    }
                    tabs.find('div[data-tab]').hide();
                    tab.title.removeClass('active');
                }
            }
            return false;
        };
        
        /* Первая ини */
        var init = function(){
            counter = 0;
            /* Активировать существующий ТАБ */
            tabs.find('ul li').each(function (idx, elm){
                var id = $(elm).attr('data-tab') || counter++;
                $(elm).attr('data-tab', id);
                tabs.find('.tab-content div:eq('+idx+')').attr('data-tab', id);
                setClick(me.findById(id));
            });
            me.trigger('tabInit',{tabs:tabs});
        };
        
        /* ПУБЛИЧНЫЕ ФУНКЦИИ */
        
        /* Поиск вкладки по ИД */
        me.findById = function(id){
            var title = tabs.find('li[data-tab="'+id+'"]');
            if (typeof title.data('tabs') === 'undefined') {
                var tab      = {};
                tab.id       = id;
                tab.index    = function(){return tabs.find('li').index(title);};
                tab.title    = title;
                tab.icon     = title.find('.xtab_icon');
                tab.caption  = title.find('.xtab_caption');
                tab.close    = title.find('.xtab_close');
                tab.content  = tabs.find('.tab-content div[data-tab="'+id+'"]');
                tab.active = function(target){
                    target = target || tab;
                    return me.active(target);
                };
                tab.disable = function(action, content){
                    return me.disable(tab, action, content);
                };
                tab.move = function(pos, animate){
                    me.move(tab, pos, animate);
                    return tab;
                };
                tab.remove = function(){
                    return me.remove(tab);
                };
                tab.hide = function(options){
                    return me.hide(tab, options);
                };
                tab.show = function(options){
                    return me.show(tab, options);
                };
                title.data('tabs', tab);
            }
            return title.data('tabs'); 
        };
        
        /* Поиск вкладки по Индексу */
        me.findByIndex = function(idx){
            var id = tabs.find('li:eq('+idx+')').attr('data-tab');
            return me.findById(id);
        };
        
        
        
        /* Получить/Установить активность вкладки */
        me.active = function(tab){
            if (typeof tab !== 'undefined') {
                tabs.find('div[data-tab]').hide();
                tab.title.tab('show');
                tab.content.show();
                clearActive(tab);
                me.trigger('tabActive',{tabs:tabs, tab:tab});
            } 
            return tab || me.findById(tabs.find('li.active').attr('data-tab'));
        };
        
        /* Получить/Установить активность вкладки */
        me.disable = function(tab, action, content){
            if (typeof tab !== 'undefined') {
                if (action){
                    tab.content.addClass('xtab_disable');
                    if (!content) {
                        tab.title.addClass('xtab_disable');
                        clearActive(tab, true);
                    }
                } else {
                    tab.title.removeClass('xtab_disable');
                    tab.content.removeClass('xtab_disable');
                }
                me.trigger('tabDisable',{tabs:tabs, tab:tab, action:action});
            }
            return tab;
        };
        
        /* Добавить вкладку */
        me.add = function(cfg, position){
            cfg = $.extend({
                id:      counter++,
                icon:    '<span class="fa fa-book"></span>',
                caption: '',
                content: '<h1><center><div class="overlay"><i class="fa fa-refresh fa-spin"></i></div></center></h1>',
                closable: true
            }, cfg);
        
            var close_style = (cfg.closable) ? '' : 'style="display:none;"';  
            
            var title = '<li data-tab="'+cfg.id+'"><div class="xtab_table">'+
                        '<div class="xtab_row">'+
                        '<div class="xtab_col xtab_icon">'+cfg.icon+'</div>'+
                        '<div class="xtab_col xtab_caption">'+cfg.caption+'</div>'+
                        '<div class="xtab_col xtab_close" '+close_style+'>×</div>'+
                        '</div>'+
                        '</div></li>';
            $(title).appendTo(tabs.find('ul'));
            $('<div class="tab-pane" data-tab="'+cfg.id+'">'+cfg.content+'</div>').appendTo(tabs.find('.tab-content'));
            
            var tab = me.findById(cfg.id);
            setClick(tab);
            me.trigger('tabAdd',{tabs:tabs, tab:tab});
            
            if (typeof position !== 'undefined'){
                tab.move(position);
            }
            return tab; 
        };
        
        /* Удалить вкладку */
        me.remove = function(tab){
            if (typeof tab !== 'undefined') {
                clearActive(tab, true);
                tab.title.remove();
                tab.content.remove();
                me.trigger('tabRemove',{tabs:tabs, tab:tab});
                return true;
            } else {
                return false;
            }
        };
        
        /* Получить количество вкладок */
        me.count =  function(){
            return tabs.find('li').size(); 
        };
        
        me.move = function(tab, pos, animate){
            if (ismoved && typeof tab !== 'undefined') {
                pos = pos || 0;
                if (pos < 0) pos = 0;
                if (pos >=me.count()) pos = me.count()-1;
                
                if (animate) {
                    ismoved = false;
                    tab.title.fadeOut(125,
                        function() {
                            if (tab.index() > pos){
                                tab.title.insertBefore(me.findByIndex(pos).title);
                            } else if (tab.index() < pos){
                                tab.title.insertAfter(me.findByIndex(pos).title);
                            }
                        }
                    ).fadeIn(125, function(){ismoved = true;});
                } else {
                    if (tab.index() > pos){
                        tab.title.insertBefore(me.findByIndex(pos).title);
                    } else if (tab.index() < pos){
                        tab.title.insertAfter(me.findByIndex(pos).title);
                    }
                }
                me.trigger('tabMove',{tabs:tabs, tab:tab});
            }
            return tab;
        };
        
        me.hide = function(tab, options){
            if (typeof tab !== 'undefined') {
                clearActive(tab, true);
                tab.title.hide(options);
                me.trigger('tabHide',{tabs:tabs, tab:tab});
            }
            return tab;
        };
        
        me.show = function(tab, options){
            if (typeof tab !== 'undefined') {
                tab.title.show(options);
                clearActive();
                me.trigger('tabShow',{tabs:tabs, tab:tab});
            }
            return tab;
        };
        
        init();
        tabs.data('tabs', me);
    } 
    return tabs.data('tabs');
}})(jQuery);