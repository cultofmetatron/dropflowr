new (Backbone.Router.extend({
  routes: module.routes,
  index : function() {
    //load the songs in here
    //var songs = new Application.Collection();

    var view = new Application.Views["disco/index"]({});
    Application.setView(view);
  }
}));
