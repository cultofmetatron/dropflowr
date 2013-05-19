
//models
App.Models = {};

App.File = Ember.Object.extend({
  pending : [],
  stats: "fighter",
  deepFill: function() {
    var self = this;
    //recurse through the tree fetching every damn thing.
  },
  fetch: function() {
    var self = this;
    self.contents = {};
    var defer = $.Deferred();
    App.dropboxClient.readdir(self.path, function(error, entries) {
      if (error) { console.log('error: ' + error); }
      entries.forEach(function(entry) {
        self.contents[entry] = { path: self.path + entry };
      });
      defer.resolveWith(self, self.contents);
    });
    self.pending.push(defer.promise());
    return self;
  },
  fetchContents: function(options) {
    var self = this;
    if (self.directory) {
      for (var subitem in self.contents) {
        self.contents[subitem].node = App.Files[self.contents[subitem].path] = App.File.create({
          path: self.contents[subitem].path
        });
      }
    }
    return self;
  },
  getInfo: function() {
    var self = this;
    var defer = $.Deferred();
    App.dropboxClient.stat(self.path, {} , function(error, data) {
      self.set('stats', Ember.Object.create(data._json));
      defer.resolve(self.get('stats'));
      if (self.stats.is_dir) {
        self.set('directory', true);
        self.fetch.call(self); //makes sure this internally resolves to the file instance
      } else {
        self.set('directory' , false);
      }
    });
    self.pending.push(defer.promise());
    return self;
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
App.Files = {};


//model that the Directory controller uses
App.Directory = Ember.Object.extend({
  pending : [],
  rootDir : App.File.create({path: '/'}),
  currentDir: {},
  foo: "hello all the world"
});
App.Directories = {};
App.Directories['main'] = App.Directory.create();
App.Directories['main'].addObserver('currentDir', function() {
  console.log('stats changed! ', this);

});


App.Directories['main'].addObserver('currentDir', function() {
  //this is the currentDir
  console.log('inbefore the loop');
  console.log(this);
  var self = this;
  self.addObserver('stats', function() {
    console.log('###########');
  });
});

App.Directories['main'].set('currentDir' , App.Directories['main'].get('rootDir'));


//App.Models.Files['root'] = App.Models.File.create({path: '/'});

//now we have the main directory controller




