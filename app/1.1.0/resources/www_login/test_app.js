Loader = {
	ssid:'1234567890',
	path:'test_login',
	count:0,
	type: {
		'css':{t:"text",fn:function(data){$("#content").append( "<style>"+data+"</style>");}},
		'js':{t:"script",fn:function(data){}},
		'html':{t:"html",fn:function(data){$("#content").append(data);}}
	},
	get: function(type, src) {
		this.count++;
		$.ajax({
			url: src+"?ssid="+this.ssid,
			dataType: this.type[type].t,
			complete: function(){
				Loader.count--;
			},
			success: this.type[type].fn
		});
	},
	wait:function(cb){if (this.count > 0) {setTimeout(function(){Loader.wait(cb)}, 300);} else {cb();}},
	loaded:function(cb){Loader._loaded = cb;},
	reload:function(){location.replace(location.origin+location.pathname+'?ssid='+this.ssid);}
};

$(function() {
	$("#content").html('');
	Loader.get("js",   Loader.path+".js");
	Loader.get("css",  Loader.path+".css");
	Loader.get("html", Loader.path+".html");
	Loader.wait(function(){
		$("#loader").fadeOut(1500, function () {
			$("body").html($("#content>"));
			if (typeof Loader._loaded === 'function') {Loader._loaded();}
		});
	});
});

