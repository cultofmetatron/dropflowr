App = Ember.Application.create({
  ready: function() {
    var self = this;
    //set up dropbox object
    $.ajax('/dropboxinfo', {
      dataType: 'json',
      success: function(data) {
        console.log(data);
        self.dropboxClient = new Dropbox.Client({
          key: data.key,
          token: data.accessToken,
          tokenSecret: data.accessSecret,
          sandbox: true
        });

      },
      error: function(error) {
        console.log('there was an error');
      }


    });
  }
});
//download the dropbox object;


App.Router.map(function() {
  // put your routes here
  this.route('dir', {path: '/dir/:directory'});
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});


//helpers


