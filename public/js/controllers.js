//controllers

App.DirectoryController = Ember.ObjectController.extend({
  directoryTree : App.Models.Directory.create()
});

App.dbox = App.DirectoryController.create();



