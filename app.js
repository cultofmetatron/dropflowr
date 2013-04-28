/**
 * Module dependencies.
 */
var configs = require ('./configuration.js');
var connect = require('connect');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var everyauth = require('everyauth');
var Q = require('q');

var ROOT = __dirname + '';

var app = express();

everyauth.debug = true;
//mongodb database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/disco1');

//declare our models
var DropboxUser = require('./models/user.js')(mongoose);

//everyauth configuration
everyauth.everymodule.userPkey('uid');
everyauth.everymodule.findUserById( function (userId, callback) {
//  User.findById(userId, callback);
  // callback has the signature, function (err, user) {...}
//}
  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%findUserById in app.js');
  DropboxUser.findUser(userId, function(err, user) {
    console.log('got the user &&&&&&&&&&&&&&& ', user);
    callback(err, user);
  });
});

everyauth.dropbox
  .consumerKey(configs.db_consumerKey)
  .consumerSecret(configs.db_consumerSecret)
  .findOrCreateUser(function (sess, accessToken, accessSecret, user) {
    console.log('session', sess);
    //login to database logic goes here!!
    var promise = this.Promise();
    DropboxUser.findOrCreateUser(user, function(err, user) {
      if (user) {
        //user was either found or created and we can create the session
        console.log('######## ', user, user.uid);
        promise.fulfill(user);
      } else {
        console.log('##############there was an error!!! ###################');
        return promise.fulfill({uid: 0 });
      }
    });
    var usr = promise;
    console.log('usr is a twit', usr);
    return usr;
  })
  .redirectPath('/');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.methodOverride());
app.use(everyauth.middleware(app));
//app.use(express.session({ secret: 'htuayreve', store: MemStore({reapInterval: 60000 * 10})}));
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(app.router);

everyauth.helpExpress(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  console.log('req.session', req.session);
  console.log('req.user', req.user);
  //(req.session.auth) ? console.log('req.auth', req.session.auth.dropbox.loggedIn): null;

  res.render('index', {
    title: "yay",
    user : everyauth.user
  });

});
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});





