
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
     * make successive async calls queue up after the current syncing is done
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
  getDirectory: function(path) {
    if (this.get('directories').findByPath(path)) {
      return this.get('directories').findByPath(path);
    } else {
      var newDir = new Models.File({path: path});
      this.get('directories').push(newDir);
      return newDir;
    }
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
  initialize: function() {
    this.id = Math.random();
    app.on('change:currentDir', this.remove, this);
    //this.model.on('change', this.delegateEvents, this);
  },
  events: {
    'click': function() {
      alert('kazooo');
    }

  },
  render: function() {
    this.$el.addClass('well').addClass('sidebar-nav');
    var self = this;
    var context = {
      path :       self.model.get('path'),
      isDirectory: self.model.get('isDirectory'),
      size:        self.model.get('size'),
      contents: (function(contents) {
        var output = [];
        for (var item in contents) {
          //console.log('item', item);
          output.push({
            path: contents[item].path,
            name: contents[item].name,
            node: (item.node || app.getDirectory(contents[item].path))
          });
        }
        return output;
      }).call(self.model, self.model.get('contents'))
    };
    this.$el.html(this.template(context));
    this.delegateEvents();
    return this;
  },
  folderaction: function(e) {
    console.log('this doesn\'t fire');
    e.preventDefault();
    alert($(e.currentTarget).data('file'));

  }


});






window.app = new App();


window.AppView = Backbone.View.extend({
  tagName: 'div',
  template: window.Templates.application,
  initialize: function(options) {
    this.model.on('change:currentDir', this.switchModel , this);
    this.model.get("currentDir").on("change", this.render, this);
  },
  switchModel: function(){
    //switches directories and binds listening to the new current directory so that we can
    //continue persisting changes
    this.model.get("currentDir").on("change", this.render, this);
    //this.model.on('change:currentdir', this.switchmodel , this);
    this.render();

  },
  render: function() {
    var self = this;
    //append the sidebar View of the current directory
    this.$el.html(self.template());
    (this.sidebarView !== undefined) ? this.sidebarView.remove() : null;
    this.sidebarView = new SidebarFileView({
      model: self.model.get('currentDir')
    });

    //this.$el.find('div#sidebar').html(this.sidebarView.render());
    this.sidebarView.setElement('div#sidebar').render();


    this.delegateEvents();
    return this;
  },
  redraw : function() {


  },

});



$(document).ready(function() {
  $.when.apply(this, app.get('currentDir').get('pending')).done(function() {
     window.appView = new AppView({
      model: app
    });

    //kickstart the view rendering
    $('body > div#entry-point').html(appView.render().$el);
  });
});


