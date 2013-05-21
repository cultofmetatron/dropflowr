
(function() {
  // the index.html
  //load the handlebars templates from the x-handlebars tags
  //names starting with '_' is a partial
  window.Templates = {};
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
    /* pending holds a list of promises generated from async calls to
     * make successive async calls quee up after the current syncing is done
     *
     * Directories holds info on all previously fetched directory data so we don't have to
     * hammer dropbox as much
     *
     * history holds a collection of reviously accessed hisories so we don't have to retrieve it
     * later on. backbutton functionality comming later
     */
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

window.SidebarFileCollectionView = Backbone.View.extend({
  collection: Models.FileCollection,
  render: function() {


  }
});

window.SidebarFileView = Backbone.View.extend({
  model: Models.File,
  tagname: 'div',
  template: Templates.sidebarFile,
  render: function() {
    this.$el.addClass('well').addClass('sidebar-nav');
    var context = {
      path :       this.model.get('path'),
      subfiles :   this.model.get('contents'),
      isDirectory: this.model.get('isDirectory'),
      size:        this.model.get('size')

    };

  }

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
    //switches directories and binds listening to the new current directory so that we can
    //continue persisting changes
    this.model.get("currentDir").on("change", this.render, this);
    this.model.on('change:currentDir', this.switchModel , this);
    this.render();


  },
  render: function() {

    var self = this;


    $('body > div#entry-point').html(self.template());
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


