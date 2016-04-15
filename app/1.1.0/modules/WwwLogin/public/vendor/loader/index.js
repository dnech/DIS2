$(function() {
	$("#content").html('');
	//Loader.get("js",   "app/app.js");
	//Loader.get("css",  "app/app.css");
	Loader.get("html", "app/index.html");
	Loader.wait(function(){
		$("#loader").fadeOut(1500, function () {
			$("body").html($("#content>"));
			if (typeof Loader._loaded === 'function') {Loader._loaded();}
		});
	});
});

