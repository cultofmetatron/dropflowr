Application.Collection.extend({
  name: "disco/playlist",
  model: Thorax.Models['disco/song'],
  dir: '/dir/music/',
  loadSongs: function() {
    var self = this;
    var promise = $.get(self.dir, function(songs) {

      console.log(songs);

    });

  }

});
