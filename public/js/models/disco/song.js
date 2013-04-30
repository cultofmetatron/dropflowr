Application.Model.extend({
  name: "disco/song",
  sync: function() {
    var self = this;
    var promise = $.get( self.path , function(data) {
      console.log(data);

    });

  }

});
