
App = Ember.Application.create({
  ready: function() {
    var self = this;
    //set up dropbox object
  }
});
App.pending = {};

//download the dropbox object;
(function() {
  var showtime = $.Deferred();
  var self = this;
  $.ajax('/dropboxinfo', {
    dataType: 'json',
    success: function(data) {
      console.log(data);
      self.dropboxClient = new Dropbox.Client({
        key: data.key,
        token: data.accessToken,
        tokenSecret: data.accessSecret
      });
      showtime.resolve();
    },
    error: function(error) {
      console.log('there was an error');
      showtime.resolve();
    }
  });
  App.pending['dropbox'] = showtime.done;
}).call(App);

App.Router.map(function() {
  // put your routes here
  this.route('directory', {path: '/directory'});
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});
//helpers


