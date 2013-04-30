Application.Collection.extend({
  name: "disco/playlist",
  collection: Application['disco/song'],
  loadSongs: function() {
    var self = this;
    var promise = $.get(self.dir, function(data) {
      //console.log(data);
      var songs = JSON.parse(data);

      songs.forEach(function(song) {
        //create a song model and add it to the collection
        var songModel = new Application.Models['disco/song']({
          filename: song,
          filepath: self.dir + '/' + song
        });
        self.push(songModel);
      });
    });
    return promise;
  }
});

// Instances of this collection can be created by calling:
// new Application.Collections["disco/playlist"]()

