$("body").addClass("hold-transition login-page");

//Loader.get("css",  "vendor/bootstrap-3.3.4/css/bootstrap.min.css");
Loader.get("css",  "vendor/font-awesome-4.5.0/css/font-awesome.min.css");
Loader.get("css",  "vendor/ionicons-2.0.1/css/ionicons.min.css");
Loader.get("css",  "vendor/adminlte-2.3.0/css/AdminLTE.min.css");
Loader.get("css",  "vendor/adminlte-2.3.0/css/skins/_all-skins.min.css");
Loader.get("css",  "vendor/iCheck/square/blue.css");
Loader.get("js",   "vendor/jQueryUI/jquery-ui.min.js");
Loader.get("js",   "vendor/bootstrap-3.3.4/js/bootstrap.min.js");

Loader.loaded(function () {
	console.log('content loaded');
	
  function test_cookies() {
		var cookieEnabled = (navigator.cookieEnabled) ? true : false;
		if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) { 
			document.cookie="COOKIE=TRUE";
			cookieEnabled = (document.cookie.indexOf("COOKIE") != -1) ? true : false;
			document.cookie = 'COOKIE=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
		return (cookieEnabled);
	}
	
  if(test_cookies()) {
		$('#page_error_cookie').hide();
		$('#page_login').show();
	}
	$('#user').focus();
	history.replaceState(2, "", "/test/");
  
  
  $('#user').focus();
	$('#btn_login').click(function(){
		App.Direct.Users.login({login:$('#user').val(), pass:$('#password').val()}, function(err, data){
			if (err) {
        if (err.cod === 'E004') {
          $('#login_error').show();
          $('#login_error_message').html(err.error);
        } else {
          $('#login_error').show();
          $('#login_error_message').html('Неизвестная ошибка сервера, смотрите console.');
          console.error('Неизвестная ошибка сервера', err);
        }
        return;
      }
      location.reload();
		});
	});
		
		// Поддержание сессии активной
	setInterval(function() {
		$.ajax({
		  url: '/test/wait',
		  success: function(res){
        $('#connect_error').hide();
        if (res !== '1') {
          location.reload();
        }
		  },
      error: function(res){
        $('#login_error').hide();
        $('#connect_error').show();
		  }
		});
	}, 10000);
	
});	
