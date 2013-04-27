
/**
 * Module dependencies.
 */
var configs = require ('./configuration.js');
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var ROOT = __dirname + '';

var app = express();
var everyauth = require('everyauth');

//mongodb database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');



console.log(configs.db_consumerKey);
console.log(configs.db_consumerSecret);

//everyauth configuration
everyauth.dropbox
  .consumerKey(configs.db_consumerKey)
  .consumerSecret(configs.db_consumerSecret)
  //.entryPath('/auth/dropbox')
  //.callbackPath('/auth/dropbox/callback')
  .findOrCreateUser(function (sess, accessToken, accessSecret, user) {
    //login to database logic goes here!!
    console.log(sess);
    console.log(accessToken);
    console.log(accessSecret);
    console.log(user);
    return 5;
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

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login', function(req, res) {
  res.render('login', {});
});
//everyauth.helpExpress(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
