//backbone.dropbox
(function(app) {
  window.Models = {};
  Models.File = Backbone.Model.extend({
    defaults: {
      path: '/',
      pending: []

    },
    getInfo: function() {
      var self = this;
      var defer = $.Deferred();
      app.get('dropboxClient').stat(self.get('path'), function(err, data) {
        for (var key in data._json) {
          self.set(key, data._json[key]);
        }
        defer.resolve( self.get('stats'));
        if (self.get('is_dir') === true) {
          self.set('isDirectory', true);
          self.getContents();
        } else {
          self.set('isDirectory', false);
        }
      });
      self.get('pending').push(defer.promise());
      return self;
    },
    getContents: function() {
      var self = this;
      self.set('contents', {});
      var defer = $.Deferred();
      app.get('dropboxClient').readdir(self.get('path'), function(err, entries) {
        //now fetch the names of files it owns
        if (error) {console.log(err); return "error";}
        entries.forEach(function(entry) {
          self.get('contents')[entry] = {
            path: self.get('path') + entry
          };
        });
      });
    }


  });

}).call(this, app);



//kickstart the view rendering
appView.render();


