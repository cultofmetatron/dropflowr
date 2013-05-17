Application.Collection.extend({
  name: "disco/playlist",
  collection: Application['disco/song'],
  loadSongs: function(directory) {
    var self = this;
    Application.dropbox.readdir(directory, {}, function(err, data) {
      var songs = data;
      songs.forEach(function(song) {
         var songModel = new Application.Models['disco/song']({
          filename: song,
          pathname: directory + '/'
        });
        songModel.loadData();
        self.push(songModel);
      });
    });
  }
});

// Instances of this collection can be created by calling:
// new Application.Collections["disco/playlist"]()

