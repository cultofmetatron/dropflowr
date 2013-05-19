// the application file
//load the handlebars templates
window.Templates = {};
(function() {
  var sources = $('script[type="text/x-handlebars-template"]');
  sources.each(function(index, item) {
    var node = $(item);
    if (node.data('template-name').match(/^_/)) {
      //its a partial
      Handlebars.registerPartial((node.data('template-name')).slice(1), Handlebars.compile(node.html()));
    } else {
      window.Templates[node.data('template-name')] = Handlebars.compile(node.html());
    }
  });

}).call(this);

window.App = Backbone.Model.extend({
  defaults: {
    pending: []

  }
});

window.app = new App();

(function() {
  var showtime = $.Deferred();
  var self = this;
  $.ajax('/dropboxinfo', {
    dataType: 'json',
    success: function(data) {
      console.log(data);
      self.set('dropboxClient' , new Dropbox.Client({
        key: data.key,
        token: data.accessToken,
        tokenSecret: data.accessSecret
      }));
      showtime.resolve();
      showtime.resolveWith(self, self.get('dropboxClient'));
    },
    error: function(error) {
      console.log('there was an error');
      showtime.resolve();
    }
  });
  self.get('pending')['dropbox'] = showtime.done;
}).call(app);




//create out submodels
window.DropboxModel = Backbone.Model.extend({



});



window.AppView = Backbone.View.extend({
  tagName: 'div',
  template: window.Templates.application,
  render: function() {
    var self = this;
    context = {

    };
    $('body > div#entry-point').html(self.template(context));
  }

});

window.appView = new AppView({
  model: app
});




