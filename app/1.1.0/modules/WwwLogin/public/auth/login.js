function Run() {
  
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
  
	history.replaceState(2, "", "/test/");
    
  $('#user').focus();
	
  function login() {
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
  };
  
  $("#password").keyup(function(event){
    if(event.keyCode == 13){
      login();
    }
  });
  
  $('#btn_login').click(function(){
		login();
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
}

$(function() {
	$("#loader").fadeOut(1500, function () {
		$("body").html($("#content>"));
    Run();    
	});
});