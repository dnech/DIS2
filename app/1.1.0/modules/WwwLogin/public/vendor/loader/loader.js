Loader = {
	//ssid:'undefined',
	//path:'login',
	count: 0,
  comple: function(){},
	type: {
		'css':{t:"text",fn:function(data){$("#content").append( "<style>"+data+"</style>");}},
		'js':{t:"script",fn:function(data){}},
		'html':{t:"html",fn:function(data){$("#content").append(data);}}
	},
	get: function(type, src) {
		this.count++;
		$.ajax({
			url: src, //+"?ssid="+this.ssid,
			dataType: this.type[type].t,
			complete: function(){
				Loader.count--;
        if (Loader.count < 1) {
          Loader.comple();
        }
			},
			success: this.type[type].fn
		});
	},
	wait:   function(cb){if (this.count > 0) {setTimeout(function(){Loader.wait(cb)}, 300);} else {cb();}},
	loaded: function(cb){Loader.comple = cb;},
	reload: function(){location.replace(location.origin+location.pathname);}
  //reload:function(){location.replace(location.origin+location.pathname+'?ssid='+this.ssid);}
};

