

window.remotes = {};
remotes.pending = {};

(function() {
  var showtime = $.Deferred();
  var self = this;
  $.ajax('/dropboxinfo', {
    dataType: 'json',
    success: function(data) {
      console.log(data);
      self.dropboxClient = new Dropbox.Client({
        key: data.key,
        token: data.accessToken,
        tokenSecret: data.accessSecret
      });
      showtime.resolve();
      showtime.resolveWith(self, self.dropboxClient);
    },
    error: function(error) {
      console.log('there was an error');
      showtime.resolve();
    }
  });
  remotes.pending.dropbox = showtime.done;
}).call(remotes);


//backbone.dropbox
(function() {
  window.Models = {};
  Models.File = Backbone.Model.extend({
    defaults: {
      path: '/',
      pending: [],
      fetch: true
    },
    initialize: function() {
      var self = this;
      if (!!this.fetch) {
        remotes.pending['dropbox'](function(dropboxClient) {
          var trigger = $.Deferred();
          self.get('pending').push(trigger.promise());
          self.getInfo(trigger);
        });
      }
    },
    fetchFile: function(file) {
      var obj = this.get('contents')[file];
      obj.node = new Models.File(obj.path);
      return obj.node;
    },
    getInfo: function(defer) {
      var self = this;
      var defer = $.Deferred();
      remotes.dropboxClient.stat(self.get('path'), function(err, data) {
        console.log(data);
        for (var key in data._json) {
          self.set(key, data._json[key]);
        }
        defer.resolve( self.get('stats'));
        (defer) ? defer.resolve() : null ;
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
      self.set('contents' , {});
      var defer = $.Deferred();
      remotes.dropboxClient.readdir(self.get('path'), function(err, entries) {
        //now fetch the names of files it owns
        if (err) {console.log(err); return "error";}
        entries.forEach(function(entry) {

          self.get('contents')[entry] = {
            name: entry,
            path: (function() {
                        //yea I know...
                      return (this.get('path') === '/') ?  '/' + entry : this.get('path') + '/' + entry;
                    }).call(self),
            node: null

          };


          /*
            path: (function() {
              //yea I know...
              return (this.get('path') === '/') ?  '/' + entry : this.get('path') + entry;
            }).call(self)
            */

        defer.resolve();
        });
      });
      console.log('loaded contents');
      self.get('pending').push(defer.promise());
    }

  });

  Models.FileCollection = Backbone.Collection.extend({
    model: Models.File,
    findByPath: function(path) {
      return this.find(function(file) {
        return file.get('path') === path;
      });
    }
  });


}).call(this);



//setup the paths




