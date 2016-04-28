(function(){
  
var menu = [
  {name: 'Меню 1', icon: 'home',   sref: 'common.custom1', state: {url: '/custom1', templateUrl: 'views/custom.html'}},
  {name: 'Меню 2', icon: 'pocket', sref: 'common.custom2', state: {url: '/custom2', templateUrl: 'views/custom.html'}},
  {name: 'Меню 3', icon: 'car',    sref: 'common.custom3', state: {url: '/custom3', templateUrl: 'views/custom.html'}},
  {name: 'Меню 4', icon: 'car',    sref: 'common', items: [
    {name: 'Под меню 1', icon: 'home',   sref: 'common.custom4', state: {url: '/custom4', templateUrl: 'views/custom.html'}},
    {name: 'Под меню 2', icon: 'pocket', sref: 'common.custom5', state: {url: '/custom5', templateUrl: 'views/custom.html'}},
    {name: 'Под меню 3', icon: 'car',    sref: 'common.custom6', state: {url: '/custom6', templateUrl: 'views/custom.html'}}
  ]}
];

appDIS.config(function ($stateProvider, $urlRouterProvider, $controllerProvider, $provide, $compileProvider){
  menu.forEach(function(item){
    if (typeof item.items === 'undefined') {
      $stateProvider.state(item.sref, item.state);
    } else {
      item.items.forEach(function(it){
        $stateProvider.state(it.sref, it.state);
      });
    }  
  });
});

appDIS.controller('menuCtrl', function() {
  this.menuList = menu;
  console.log('menuCtrl', this.menuList);
});





/* LIBS */
appDIS.config(function ($stateProvider, $urlRouterProvider, $controllerProvider, $provide, $compileProvider){
  $stateProvider.state ('common.libs', {
    url: '/libs',
    templateUrl: 'views/libs.html'
  }); 
});
 



appDIS.controller('libsCtrl', function($scope) {
   
  /* Список библиотек */
  $scope.list     = {};
  $scope.listMsg  = '';
  $scope.listShow = false;
  
  $scope.listUpdate = function() {
    App.Direct.AdminArea.Libs.list({}, (err, data)=>{
      $scope.$apply(function () {
        if (err) {
          $scope.list = {};
          $scope.listMsg = err;
          console.error('listCtrl.listUpdate', err);
          return; 
        }
        $scope.list = data;
        $scope.listMsg = '';
        console.log('listCtrl.listUpdate', data);
      }); 
    });
  }; 
  
  
  $scope.tabs = []; 

  $scope.addTab = function(name, type) {
    
    var idx;
    
    console.log('addTab Start', name, id);
    
    $scope.tabs.forEach((item, i)=>{
      console.log('addTab forEach', item);
      if (name === item.orig) {
        idx = i;
      }
    });

    if (typeof idx !== 'undefined') { 
      $scope.tabs[idx].active = true;
      console.log('addTab Finding Select', $scope.active);
      return;
    }
    
    var id = $scope.tabs.length;
    initLib(id, name, (type === 'system'));
    $scope.getData(id);
    $scope.tabs[id].active = true;
    console.log('addTab Finding New Tab', $scope.active);
  }; 

  $scope.closeTab = function(idx) {
    console.log('closeTab ok', idx);
    $scope.tabs.splice(idx, 1);
  };

  $scope.updateTab = function(idx) {
    var name = $scope.tabs[idx].orig;
    var ro = $scope.tabs[idx].ro;
    initLib(idx, name, ro);
    $scope.getData(idx);
    $scope.tabs[idx].active = true;
  };
  
  // Библиотека
  function initLib(id, name, ro) {
    $scope.tabs[id] = {
      modifed: false,
      protect: true,
      orig:   name,
      name:   name,
      ro:     ro,
      data:   {},
      error:   {},
      editors: {
        acl: {
          mode: 'json',
          editor: {}
        },
        sandbox: {
          mode: 'javascript',
          editor: {}
        },
        src: {
          mode: 'javascript',
          editor: {}
        },
        font:{
          name: "Courier New",
          size: "10pt"
        }
      },
      aceLoadedAcl: function(e) {$scope.aceLoaded(id, 'acl', e);},
      aceLoadedSb:  function(e) {$scope.aceLoaded(id, 'sandbox', e);},
      aceLoadedSrc: function(e) {$scope.aceLoaded(id, 'src', e);}
    };   
  };
  
  $scope.getData = function(id) {
    var lib = $scope.tabs[id];
    App.Direct.AdminArea.Libs.get(lib.orig, (err, data)=>{
      $scope.$apply(function () {
        
        if (err) {
          lib.error = err;
          growlService.growl('Error: '+err, 'inverse');
          console.error('libsCtrl.getLib', err);
          return; 
        }
        
        lib.modifed = false;
        lib.data    = data;
        loadLib(id);
        
        console.log('libsCtrl.getLib', lib.orig);
      }); 
    });
  };
  
  $scope.setData = function(id) {
    var lib = $scope.tabs[id];
    App.Direct.AdminArea.Libs.set({name:lib.name, data:saveLib(id)}, (err, data)=>{
      $scope.$apply(function () {
        if (err) {
          lib.error = err;
          growlService.growl('Error: '+err, 'inverse');
          console.error('libsCtrl.setData', err);
          return; 
        }
        lib.modifed = false;
        lib.orig = lib.name;
        $scope.listUpdate();
        console.log('libsCtrl.setData', data);
      }); 
    });
  };
  
  $scope.delData = function(id) {
    var lib = $scope.tabs[id];
    App.Direct.AdminArea.Libs.delete(lib.name, (err, data)=>{
      $scope.$apply(function () {
        if (err) {
          lib.error = err;
          growlService.growl('Error: '+err, 'inverse');
          console.error('libsCtrl.delData', err);
          return; 
        }
        $scope.closeTab(id);
        $scope.listUpdate();
        console.log('libsCtrl.delData', data);
      }); 
    });
  };
  
  
  
  
  // Список редакторoв Ace  
  
  $scope.change = function(id) {
    console.log('change', id);
    var lib = $scope.tabs[id];
    lib.modifed = true;
    lib.editors.acl.editor.getSession().setMode("ace/mode/"+lib.editors.acl.mode);
    lib.editors.sandbox.editor.getSession().setMode("ace/mode/"+lib.editors.sandbox.mode);
    if (lib.data.script) {
      lib.editors.src.editor.getSession().setMode("ace/mode/javascript");
    } else { 
      lib.editors.src.editor.getSession().setMode("ace/mode/html");
    }
  };
  
  // Set data in editors 
  function loadLib(id) {
    var lib = $scope.tabs[id];

    lib.editors.acl.editor.setValue(lib.data.acl, -1);
    lib.editors.sandbox.editor.setValue(lib.data.sandbox, -1);
    lib.editors.src.editor.setValue(lib.data.src, -1);
        
    lib.editors.acl.editor.resize();
    lib.editors.sandbox.editor.resize();
    lib.editors.src.editor.resize();
    
    lib.editors.acl.editor.see     = true;
    lib.editors.sandbox.editor.see = true;
    lib.editors.src.editor.see     = true;
  };
  
  // Compile data from editors 
  function saveLib(id) {
    var lib = $scope.tabs[id];
    return {
      enable:  lib.data.enable,
      script:  lib.data.script,
      acl:     lib.editors.acl.editor.getValue(),
      sandbox: lib.editors.sandbox.editor.getValue(),
      src:     lib.editors.src.editor.getValue()
    }  
  };
  
  
  
  
  
  
  $scope.aceLoaded = function(id, type, _editor) {
    _editor.$blockScrolling = true;
    
    var lib = $scope.tabs[id];
    _editor.getSession().setMode("ace/mode/"+lib.editors[type].mode);
    _editor.setOptions({
      fontFamily: lib.editors.font.name,
      fontSize: lib.editors.font.size
    });
    
    lib.editors[type].editor = _editor;
    
    // ============================= 
    var _session = _editor.getSession();
    //var _renderer = _editor.renderer;

    // Options
    //_editor.setReadOnly(true);
    //_session.setUndoManager(new ace.UndoManager());
    //_renderer.setShowGutter(false);

    // Events
    
    //_editor.on("changeSession", function(e){ 
    //  lib.modifed = true;
    //});
    
    _session.on("change", function(e){ 
      if (_editor.see) {
        $scope.$apply(function () {
          lib.modifed = true;
        });
      }  
    });
    
    // ============================= 
    
  };
  
});
 
/*
appDIS.controller('libsCtrl', function($scope) {
   
  // Список библиотек
  $scope.list     = {};
  $scope.listMsg  = '';
  $scope.listShow = false;
  
  $scope.listUpdate = function() {
    App.Direct.AdminArea.Libs.list({}, (err, data)=>{
      $scope.$apply(function () {
        if (err) {
          $scope.list = {};
          $scope.listMsg = err;
          console.error('libsCtrl.listUpdate', err);
          return; 
        }
        $scope.list = data;
        $scope.listMsg = '';
        console.log('libsCtrl.listUpdate', data);
      }); 
    });
  };
  
  
  // Библиотека
  clearLib();
  
  function clearLib(err) {
    $scope.loaded  = false;
    $scope.name    = '';
    $scope.data    = {};
    $scope.error   = err || {};
  };
  
  $scope.getData = function(name) {
    App.Direct.AdminArea.Libs.get(name, (err, data)=>{
      $scope.$apply(function () {
        if (err) {
          clearLib(err);
          console.error('libsCtrl.getLib', err);
          return; 
        }
        
        $scope.loaded = true;
        $scope.name   = name;
        $scope.data   = data;
        loadLib();
        
        console.log('libsCtrl.getLib', name);
      }); 
    });
  };
  
  $scope.setData = function() {
    App.Direct.AdminArea.Libs.set({name:$scope.name, data:saveLib()}, (err, data)=>{
      $scope.$apply(function () {
        if (err) {
          $scope.error = err;
          console.error('libsCtrl.setData', err);
          return; 
        }
        $scope.listUpdate();
        console.log('libsCtrl.setData', data);
      }); 
    });
  };
  
  
  
  
  
  // Список редакторв Ace 
  var Editors = {
    acl: {
      mode: 'json',
      editor: {}
    },
    sandbox: {
      mode: 'javascript',
      editor: {}
    },
    src: {
      mode: 'javascript',
      editor: {}
    },
    font:{
      name: "Courier New",
      size: "10pt"
    }
  }; 
  
  function changeEditor() {
    Editors.acl.editor.getSession().setMode("ace/mode/"+Editors.acl.mode);
    Editors.sandbox.editor.getSession().setMode("ace/mode/"+Editors.sandbox.mode);
    if ($scope.data.script) {
      Editors.src.editor.getSession().setMode("ace/mode/javascript");
    } else { 
      Editors.src.editor.getSession().setMode("ace/mode/html");
    }
  };
  
  // Set data in editors 
  function loadLib() {
    Editors.acl.editor.setValue($scope.data.acl, -1);
    Editors.sandbox.editor.setValue($scope.data.sandbox, -1);
    Editors.src.editor.setValue($scope.data.src, -1);
        
    Editors.acl.editor.resize();
    Editors.sandbox.editor.resize();
    Editors.src.editor.resize();
  };
  
  // Compile data from editors 
  function saveLib() {
    return {
      script: $scope.data.script,
      acl: Editors.acl.editor.getValue(),
      sandbox: Editors.sandbox.editor.getValue(),
      src: Editors.src.editor.getValue()
    }  
  };
  
  
  
  
  $scope.aceLoadedAcl = function(e) {$scope.aceLoaded('acl', e);};
  $scope.aceLoadedSb  = function(e) {$scope.aceLoaded('sandbox', e);};
  $scope.aceLoadedSrc = function(e) {$scope.aceLoaded('src', e);};
  
  $scope.aceLoaded = function(id, _editor) {
    
    _editor.getSession().setMode("ace/mode/"+Editors[id].mode);
    _editor.setOptions({
      fontFamily: Editors.font.name,
      fontSize: Editors.font.size
    });
    
    Editors[id].editor = _editor;
    
    // ============================= 
    //var _session = _editor.getSession();
    //var _renderer = _editor.renderer;

    // Options
    //_editor.setReadOnly(true);
    //_session.setUndoManager(new ace.UndoManager());
    //_renderer.setShowGutter(false);

    // Events
    //_editor.on("changeSession", function(e){ 
    //  //console.log('libsCtrl.ace.changeSession', e);
    //});
    //_session.on("change", function(e){ 
    //  //console.log('libsCtrl.ace.change', e);
    //});
    // ============================= 
    
  };
  
});
*/


            
})();