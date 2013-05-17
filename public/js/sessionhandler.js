//takes care of session data

Application.sessionHandler = {};
Application.getDropbox = function(callback) {
  if (Application.dropbox) {
    callback();
  }
  else {
    var promise = $.get('/dropboxinfo/', function(data) {
      console.log(data);
      Application.dropbox = new Dropbox.Client({
        token: data.accessToken,
        tokenSecret: data.accessSecret,
        key: data.key
      });
    }, 'json').done(callback);
  }

};
Application.sessionHandler.loginStatus = function(callback, context) {
  context = context || Application;
  sessionHandler = this;
  if ((sessionHandler.loggedin !== undefined) && (sessionHandler.loggedin === true)) {
    Application.getDropbox(callback);
  } else {
    //perform a get request, if the serer responds with a negative
    //redirect to #login
    $.get('/login', function(data) {
      if (data.loggedin) {
        console.log(data);
        sessionHandler.loggedin = true;
        Application.getDropbox(function() {
          callback(Application.dropbox);
        });
      } else {
        //reroute to #login
        sessionHandler.loggedin = false;
        window.location.hash = 'login';

      }

    }, 'json');


  }
};


