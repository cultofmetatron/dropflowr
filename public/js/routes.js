//Routes file

App.Router.map(function() {
  // put your routes here
  this.route('directory', {path: '/directory'});
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});

App.DirectoryRoute = Ember.Route.extend({
 //setupController: function(controller, song) {
  //controller.set('currentDir', controller.rootDir);
 //}
  renderTemplate: function() {
    this.render('directory', { controller: 'directory' });
  },
  setupController: function(controller, model) {
    controller.set('content', App.Directories.main );
  }
});

