

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

      console.log('fetching path :', self.get('path'));
      if (!!this.fetch) {
        remotes.pending['dropbox'](function(dropboxClient) {
          self.getInfo();
        });
      }
    },
    fetchFile: function(file) {
      var obj = this.get('contents')[file];
      obj.node = new Models.File(obj.path);
      return obj.node;
    },
    getInfo: function(trigger) {
      var self = this;
      var defer = $.Deferred();
      remotes.dropboxClient.stat(self.get('path'), function(err, data) {
        if (err) {console.log('there was an err: ', err); defer.resolve(); return null;  }
        console.log(data);
        for (var key in data._json) {
          self.set(key, data._json[key]);
        }
        defer.resolve();
        if (self.get('is_dir') === true) {
          self.set('isDirectory', true);
          self.getContents();
        } else {
          self.set('isDirectory', false);
        }
        console.log('changing', self);
        self.trigger('change');
        self.set('pending', []);

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
        if (err) {console.log(err); defer.resolve(); return "error";}
        entries.forEach(function(entry) {

          self.get('contents')[entry] = {
            name: entry,
            path: (function() {
                        //yea I know...
                      return (this.get('path') === '/') ?  '/' + entry : this.get('path') + '/' + entry;
                    }).call(self),
            node: null

          };
        defer.resolve();
        console.log('change we can believe in!!');
        self.trigger('change');

        });
      });
      self.get('pending').push(defer.promise());
    }

  });

  Models.BinaryFile = Models.File.extend({
    initialize: function() {
      console.log('file created');
    },
    isBinary: function() {
      if (this.get('isDirectory')) {
        return false;
      }
      return true;
    },
    fetchBinary: function() {
      var self = this;
        var defer = $.Deferred();
        self.get('pending').push(defer.promise());
        remotes.dropboxClient.readFile(self.get('path'), {blob: true }, function(err, data) {
          console.log('this is getting called');
          self.set('binaryContents' , data);
          self.set('downloadUrl', URL.createObjectURL(self.get('binaryContents')));
          self.set('loaded', true);
          console.log('fetching the url');
          defer.resolve(self.get('downloadUrl'));
        });
        return defer.promise();
    },
    getBinaryUrl: function() {
      return this.get('downloadUrl');
    },
    type: function() {
      return 'binary';
    }
  });

  Models.AudioFile = Models.File.extend({


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





