//controllers

App.DirectoryController = Ember.ObjectController.extend({
  root : App.Models.Files['/'] || (App.Models.Files['/'] = App.Models.File.create({path: '/'}))
});

App.dbox = App.DirectoryController.create();



