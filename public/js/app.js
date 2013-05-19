// the application file
//load the handlebars templates
window.Templates = {};
(function() {
  var sources = $('script[type="text/x-handlebars-template"]');
  sources.each(function(index, item) {
    var node = $(item);
    window.Templates[node.data('template-name')] = Handlebars.compile(node.html());
  });
}).call(this);


window.App = Backbone.Model.extend({});

window.app = new App();

window.Views.App = Backbone.View.extend({
  tagName: 'div',
  template: window.Templates.application,
  render: function() {
    $('body').append(this.template());
  }

});

window.appView = new AppView({
  model: app
});





