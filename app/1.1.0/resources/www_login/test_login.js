$("body").addClass("hold-transition login-page");

//Loader.get("css",  "vendor/bootstrap-3.3.4/css/bootstrap.min.css");
Loader.get("css",  "vendor/font-awesome-4.5.0/css/font-awesome.min.css");
Loader.get("css",  "vendor/ionicons-2.0.1/css/ionicons.min.css");
Loader.get("css",  "vendor/adminlte-2.3.0/css/AdminLTE.min.css");
Loader.get("css",  "vendor/adminlte-2.3.0/css/skins/_all-skins.min.css");
Loader.get("css",  "vendor/iCheck/square/blue.css");
Loader.get("js",   "https://code.jquery.com/ui/1.11.4/jquery-ui.min.js");
Loader.get("js",   "vendor/bootstrap-3.3.4/js/bootstrap.min.js");

Loader.loaded(function () {
	console.log('content loaded');
	$('#user').focus();
	$('#btn_login').click(function(){
		App.Direct.Users.Login({name:$('#user').val(), pass:$('#password').val()}, function(ok){
			if (ok.success) {
				location.reload();
			} else {
				console.log('ERROR', ok);
			}
		}, function(err){
			console.log('SERVER ERROR', err)
		});
	});
		
		// Поддержание сессии активной
	setInterval(function() {
		$.ajax({
		  url: '/test/wait.html',
		  success: function(){
			console.log('SSID wait');
		  }
		});
	}, 5000); //500 seconds
	
});	
