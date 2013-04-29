/**
 * Module dependencies.
 */
var configs = require ('./configuration.js');
var connect = require('connect');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var querystring = require('querystring');
var Q    = require('q');
var everyauth = require('everyauth');
var Dropbox = require('dropbox');
var dropboxClient = null; //is initialized on every req/response cycle

var ROOT = __dirname + '';

var app = express();

everyauth.debug = true;
//mongodb database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/disco1');

//declare our models
var DropboxUser = require('./models/user.js')(mongoose);

//get dropbox data on every request cyclen if logged in
var dropboxObject = function(req, res, next) {
  if (req.user) {
    var accessToken = req.session.dropboxTokens.accessToken;
    var accessSecret = req.session.dropboxTokens.accessSecret;

     dropboxClient = new Dropbox.Client({
          key: configs.db_consumerKey,
          secret: configs.db_consumerSecret,
          token: accessToken,
          tokenSecret: accessSecret,
          uid: req.user.uid,
          sandbox: false
      });
  }
    if (next) {next();}
};

var loggedInGuard = function(req, res, next) {
  if (!req.xhr) { // not an ajax call
    if (req.user) {
      //user is logged in
      next();
    } else {
      //user is not logged in
      console.log(req);
      req.session.forwardUrl = req.route.path;
      res.redirect('/login');
      //next(); ?
    }
  } else {
    if (req.user) {
      //user logged in
      next();
    } else {
      //TODO create json response to failed login

    }
  }
};



//configures the session handlers for dropbox
require('./authentication.js')(everyauth, DropboxUser, configs);

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
app.use(dropboxObject);
//app.use(express.session({ secret: 'htuayreve', store: MemStore({reapInterval: 60000 * 10})}));
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




// we redirect the user to /public where we can load the rich client
app.get('/', loggedInGuard ,function(req, res) {
  res.redirect('/public');
});

app.get('/public', loggedInGuard ,function(req, res) {
  console.log('########### req.route', req.route);
  console.log('req.user', req.user);
  //(req.session.auth) ? console.log('req.auth', req.session.auth.dropbox.loggedIn): null;

  res.render('index', {
    title: "DropFlowr",
    everyuser : (function() { return (req.user) ? req.user.display_name : "log in"; })()
  });

});

app.get('/login', function(req, res) {
  res.render('login', {});
});


//the dropbox file access directives

app.get('/doo', loggedInGuard, function(req, res) {
  var direc = "Public/resume.pdf";
  dropboxClient.metadata(direc,  {} ,function(err, data) {
    if (err) { console.log(err); }
    res.end(JSON.stringify(data));
  });

});

app.get('/dir/*', loggedInGuard ,function(req, res) {
  console.log('________________________________');
  //console.log('req.query', req.query);
  //console.log('req.params', req.params);

  dropboxClient.readdir('/' + req.params , function(error, entries) {
    if (error) {
      return error;
    }

    var directoryObject = {};
    var allGotten = Q.defer();
    var entriesCount = 0;
    entries.forEach(function(entry) {
      console.log('%%%%%%%%%%%', req.params);
      var item = req.params + '/' + entry;
      console.log(item);
      dropboxClient.metadata(item,  {} ,function(err, data) {
        if (err) { console.log(err); }
        console.log('the data: ' ,data);
        directoryObject[item] = data;
        entriesCount++;
        if (entriesCount === entries.length) {
          allGotten.resolve();
        }
      });
    });
    Q.when(allGotten.promise).then(function() {
      console.log('***********************************');
      console.log('directory object', directoryObject);
      res.end(JSON.stringify(directoryObject));
    });
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





