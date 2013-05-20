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
    pending: [],
    rootDir: new Models.File({}),
    directories: []
  },
  initialize: function() {
    this.get('directories').push("hello");
    this.set('currentDir', this.get('rootDir'));
  }
});

window.app = new App();

//create out submodels
window.DropboxModel = Backbone.Model.extend({



});



window.AppView = Backbone.View.extend({
  tagName: 'div',
  template: window.Templates.application,
  initialize: function() {
    this.model.on('change:currentDir', function() {
      console.log(this);
      console.log('it works!!');
    }, this);

  },
  render: function() {
    var self = this;
    context = {

    };
    $('body > div#entry-point').html(self.template(context));
  }

});

$(document).ready(function() {
  window.appView = new AppView({
    model: app
  });

  //kickstart the view rendering
  appView.render();


});



