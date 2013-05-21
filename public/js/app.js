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
    directories: new Models.FileCollection(),
    history: new Models.FileCollection()
  },
  initialize: function() {
    this.get('directories').push(this.get('rootDir'));
    this.set('currentDir', this.get('rootDir'));
  },
  navigateTo: function(newDir) {
    console.log("this: " , this, "app : ",  app);
    console.log(this.get('history'));
    console.log( this.get('history').push);
    this.get('history').push(this.get('currentDir'));
    var nextDir = this.get('directories').findByPath(newDir);
    if (!nextDir) { //the directory has not been fetched yet
      this.get('directories').push(new Models.File({path:newDir}));
      nextDir = this.get('directories').findByPath(newDir);
    }
    this.set('currentDir', nextDir);
  }
});


window.SidebarFileView = Backbone.View.extend({
  model: Models.File,
  tagname: 'div'


});






window.app = new App();


window.AppView = Backbone.View.extend({
  tagName: 'div',
  template: window.Templates.application,
  initialize: function() {
    this.model.on('change:currentDir', function() {
      console.log('grrrr', this);
      console.log('it works!!');
    }, this);


  },
  render: function() {
    var self = this;
    context = {
      path :       self.model.get('currentDir').get('path'),
      subfiles :   self.model.get('currentDir').get('contents'),
      isDirectory: self.model.get('currentDir').get('isDirectory'),
      size:        self.model.get('currentDir').get('size')
    };
    $('body > div#entry-point').html(self.template(context));
  },
  redraw : function() {


  }
});





$(document).ready(function() {
  window.appView = new AppView({
    model: app
  });

  //kickstart the view rendering
  appView.render();


});



