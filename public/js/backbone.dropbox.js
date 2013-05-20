

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
          self.getInfo();
        });
      }
    },
    getInfo: function() {
      var self = this;
      var defer = $.Deferred();
      remotes.dropboxClient.stat(self.get('path'), function(err, data) {
        console.log(data)
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
      self.set('contents', new Models.FileCollection());
      var defer = $.Deferred();
      remotes.dropboxClient.readdir(self.get('path'), function(err, entries) {
        //now fetch the names of files it owns
        if (err) {console.log(err); return "error";}
        entries.forEach(function(entry) {

          self.get('contents').push(
            new Models.File({
              path: (function() {
                        //yea I know...
                      return (this.get('path') === '/') ?  '/' + entry : this.get('path') + '/' + entry;
                    }).call(self),
              fetch: false
            }));
          /*
            path: (function() {
              //yea I know...
              return (this.get('path') === '/') ?  '/' + entry : this.get('path') + entry;
            }).call(self)
            */

        defer.resolve();



        });
      });
      self.get('pending').push(defer.promise());
    }/*,
    getContentsInfo: function() {
      //window.debg = {}
      var self = this;
      $.when.apply(this, this.get('pending')).done(function() {
        if (self.get('isDirectory')) {
          console.log('contents', self.get('contents'));
          for (var key in self.get('contents')) {
            var node = self.get('contents')[key].node = new Models.File({
              path: self.get('contents')[key].path
            });
            //window.debg[node.path] = node
            //window.setTimeout(function() {
              $.when.apply(this, node.get('pending')).done(function() {
                console.log('khaaaaaaan: ', self);
                console.log(self.get('contents')[key].path);
                console.log('node', node);
                console.log('isDirectory exists?', node.get('isDirectory'));
                node.getContentsInfo();
              });
            //}, 2000);
          }
        }


      })

    } */
  });

  Models.FileCollection = Backbone.Collection.extend({
    model: Models.File
  });


}).call(this);



//setup the paths




