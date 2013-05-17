new (Backbone.Router.extend({
  routes: module.routes,
  isloggedin: function(route, callback) {
    var self = this;
    Application.sessionHandler.loginStatus(function(data) {
        callback(route);
    });
  },
  index: function() {
    var self = this;
    this.isloggedin(window.location.hash, function(route) {
       var view = new Application.Views['disco/index']({});
       Application.setView(view);
       var playlistview = new Application.Views['disco/playlist']({
        collection: (new Application.Collections['disco/playlist']())
       });
       playlistview.collection.loadSongs('/music');
       playlistview.appendTo('body');
    });
  },

  login: function() {
    var view = new Application.Views['disco/login']({});
    Application.setView(view);
  },

  playlist: function() {
    this.isloggedin(window.location.hash, function() {

    });
  }


}));
