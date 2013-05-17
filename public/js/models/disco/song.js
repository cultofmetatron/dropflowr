Application.Model.extend({
  name: "disco/song",
  loadData: function() {
    var self = this;
    Application.getDropbox(function() {
      Application.dropbox.metadata(self.get('pathname') + self.get('filename'),
        {}, function(err, data) {
        for (var key in data._json) {
          self.set(key, data._json[key]);
        }
      });
    });
  },
  /* callback(public_url) */
  getPublicURL : function(callback) {
    var self = this;
    Application.getDropbox(function() {
      Application.dropbox.makeUrl(self.get('pathname') + self.get('filename'), {},
        function(err, url) {
          if (err) { console.log(err); }
          callback(url);
        });
    });

  }

});

// Instances of this model can be created by calling:
// new Application.Models["disco/song"]()
