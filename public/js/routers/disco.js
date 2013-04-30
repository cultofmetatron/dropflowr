new (Backbone.Router.extend({
  routes: module.routes,
  isloggedin: function() {


  },
  index: function() {
    var view = new Application.Views['disco/index']({});
    Application.setView(view);

  },

  login: function() {
    var view = new Application.Views['disco/login']({});
    Application.setView(view);
  }


}));
