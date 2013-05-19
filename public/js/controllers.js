//controllers

App.DirectoryController = Ember.ObjectController.extend({
  size: (function() {
    console.log(this.get('content.foo'));
    return this.get('content.foo');

  }).property('content.foo')
});




