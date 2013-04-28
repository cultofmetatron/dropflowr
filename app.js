/**
 * Module dependencies.
 */
var configs = require ('./configuration.js');
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var Q = require('q');

var ROOT = __dirname + '';

var app = express();
var everyauth = require('everyauth');

//mongodb database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/disco1');

//declare our models
var DropboxUser = require('./models/user.js')(mongoose);
console.log(DropboxUser);

//everyauth configuration
everyauth.dropbox
  .consumerKey(configs.db_consumerKey)
  .consumerSecret(configs.db_consumerSecret)
  .findOrCreateUser(function (sess, accessToken, accessSecret, user) {
    //login to database logic goes here!!
    var deferred = Q.defer();
    DropboxUser.findOrCreateUser(user, function(err, user) {
      if (user) {
        //user was either found or created and we can create the session
        deferred.resolve(user.id);
      } else {
        return deferred.resolve(0);
      }
    });

    return deferred.promise;
  })
  .redirectPath('/');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
app.use(everyauth.middleware());
app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  console.log(req.user);
  res.render('index', {
    title: "yay",
    user : req.user
  });

});
app.get('/users', user.list);
app.get('/login', function(req, res) {
  option = {};
  if (req.user) { console.log(req.user); }
  res.render('login', option);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




