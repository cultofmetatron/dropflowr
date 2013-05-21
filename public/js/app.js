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
    this.get('history').push(this.get('currentDir'));
    var nextDir = this.get('directories').findByPath(newDir);
    if (!nextDir) { //the directory has not been fetched yet
      this.get('directories').push(new Models.File({path:newDir}));
      nextDir = this.get('directories').findByPath(newDir);
    }
    this.set('currentDir', nextDir);
  },
  resetDir: function() {
    this.navigateTo(this.get('rootDir').get('path'));
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
    this.model.on('change:currentDir', this.switchModel , this);
    this.model.get("currentDir").on("change", this.render, this);
  },
  switchModel: function(){
    this.model.get("currentDir").on("change", this.render, this);
    this.model.on('change:currentDir', this.switchModel , this);
    this.render();


  },
  listenCurrentDir: function() {


  },
  unlistenCurrentDir: function() {


  },
  render: function() {
    var self = this;
    console.log('this: ' , this);
    console.log('the current drectory size', this.model.get('currentDir').attributes);
    //debugger
    context = {
      path :       self.model.get('currentDir').get('path'),
      subfiles :   self.model.get('currentDir').get('contents'),
      isDirectory: self.model.get('currentDir').get('isDirectory'),
      size:        self.model.get('currentDir').get('size'),
      greeting: 'what? this works?'
    };
    $('body > div#entry-point').html(self.template(context));
  },
  redraw : function() {


  }
});



$(document).ready(function() {
  $.when.apply(this, app.get('currentDir').get('pending')).done(function() {
     window.appView = new AppView({
      model: app
    });

    //kickstart the view rendering
    appView.render();
  });
});


