
//models
App.Models = {};

App.Models.File = Ember.Object.extend({
  fetch: function() {
    var self = this;
    self.contents = {};
    App.dropboxClient.readdir(self.path, function(error, entries) {
      if (error) { console.log('error: ' + error); }
      entries.forEach(function(entry) {
        self.contents[entry] = self.path + entry;
      });
    });
  },
  getInfo: function() {
    var self = this;
    App.dropboxClient.stat(self.path, {} , function(error, data) {
      self.stats = data._json;
      if (self.stats.is_dir) {
        self.directory = true;
        self.fetch.call(self); //makes sure this internally resolves to the file instance
      } else {
        self.directory = false;
      }
    });
  },
  init: function() {
    var self = this;
    //defers evaluation until we get dropbox credentials
    App.pending['dropbox'](function() {
      self.getInfo();
    });
  }
});
//the apps Files
App.Models.Files = {};

//App.Models.Files['root'] = App.Models.File.create({path: '/'});

//now we have the main directory controller




