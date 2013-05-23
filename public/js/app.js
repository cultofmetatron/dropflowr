
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
     * Directories holds info on all previously fetched data so we don't have to
     * hammer dropbox as much
     *
     * BinaryFiles holds a list of Binary files
     *
     * history holds a collection of reviously accessed hisories so we don't have to retrieve it
     * later on. backbutton functionality comming later
     */
    pending: [],
    rootDir: new Models.File({}),
    directories: new Models.FileCollection(),
    history: new Models.FileCollection(),
    playlist: new Models.FileCollection()
  },
  initialize: function() {
    this.get('directories').push(this.get('rootDir'));
    this.set('currentDir', this.get('rootDir'));
    this.on('navigate', this.navigateTo, this );
    this.on('back', this.back, this);
  },
  play: function() {
    this.set('currentSong', this.get('currentDir'));

  },
  queue: function(song) {
    this.get('playlist').push(song);
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
  },
  back: function() {
    if (this.get('history').length !== 0) {
      var prev = this.get('history').pop();
      this.set('currentDir', prev);
    }
  }
});


window.SidebarFileCollectionView = Backbone.View.extend({
  collection: Models.FileCollection,
  render: function() {


  }
});

var getType = function(name) {
  //return a type based on file extension
  if (name.match(/.(mp3|flac|ogg|aac)$/)) {
    return "audio";
  }
  if (name.match(/.(jpg|jpeg|png)$/)) {
    return "image";
  }
  if (name.match(/.(pdf)$/)) {
    return "pdf";
  }
  if (name.match(/.(txt|html|rtf|mdn)/)) {
    return 'text';
  }
  return 'other';
};

window.SidebarAudioView = Backbone.View.extend({
  model: Models.BinaryFile,
  template: Templates.sidebarPlayer,
  initialize: function() {
    var self = this;
    console.log('booting up the file', this.model.get('pending'));
    $.when.apply(this, this.model.get('pending')).done(function() {
      console.log('time to kickstart the downloads');
      self.model.fetchFile();
    });
    this.model.on('change', this.render, this);

  },
  render: function() {
    var self = this;
    var context = {
      sourcePath: self.model.getBinaryUrl()

    };
    this.$el.html(this.template(context));
    return this;
  }

});

window.SidebarFileView = Backbone.View.extend({
  model: Models.File,
  tagname: 'div',
  template: Templates.sidebarFile,
  initialize: function() {
    this.id = Math.random();
    app.on('change:currentDir', this.remove, this);
    //this.model.on('change', this.render, this);
  },
  events: {
    'click ul.filelist a' : 'navigate',
    'click a.action'      : 'interceptAction'
  },
  render: function() {
    console.log('rerendering fileview');
    this.$el.addClass('well').addClass('sidebar-nav');
    var self = this;
    var context = {
      path :       self.model.get('path'),
      isDirectory: self.model.get('isDirectory'),
      size:        self.model.get('size'),
      mime_type:   self.model.get('mime_type'),
      is_dir:      self.model.get('is_dir'),
      is_audio:    (self.model.get('mime_type'))? !! self.model.get('mime_type').match(/^audio\//) : null ,
      contents: (function(contents) {
        var output = [];
        for (var item in contents) {
          //console.log('item', item);
          var data = {
            path: contents[item].path,
            name: contents[item].name,
            node: (item.node || app.getDirectory(contents[item].path))
          };

          data.type = getType(data.name);
          output.push(data);
        }
        return output;
      }).call(self.model, self.model.get('contents'))
    };
    if (!self.fileView) {
      $.when.apply(this, self.model.get('pending')).done(function() {
        if (!self.model.get('is_dir') && self.model.get('mime_type')) {
          //console.log('rendering audio view');
          if (self.model.get('mime_type').match(/^audio\//)) {
            self.fileView = new SidebarAudioView({
              model: new Models.BinaryFile({path:self.model.get('path')})
            });
            //set the view in the partial
            console.log('rendering the audio view');
            self.fileView.setElement('div#sidebarFileInfo').render();
          }
        }
      });
    }
    else {
      self.fileView.setElement('div#sidebarFileInfo').render();
    }


    this.$el.html(this.template(context));
    this.delegateEvents();
    return this;
  },
  navigate: function(e) {
    e.preventDefault();
    var newPath = $(e.currentTarget).attr('href');
    app.trigger('navigate', newPath);
  },
  interceptAction: function(e) {
    e.preventDefault();
    console.log($(e.currentTarget).data('action'));
    app.trigger($(e.currentTarget).data('action'), $(e.currentTarget).data('action'));
  }


});

window.PlayerView = Backbone.View.extend({
  model: Models.File,
  template: Templates.player,
  initialize: function() {
    // app.on('change:currentSong', this.render, this);
    // not necessary since we rerender the scene
  },
  playSong: function(song) {
    this.$el.find('audio').attr('src', song.path);
    this.render();
  },
  render: function() {
    var context = {
      path: this.model.getSongPath()

    };
    this.$el.html(this.template(context));
  }
});

window.PlaylistView = Backbone.View.extend({
  tagName: 'div',
  template: Templates.playlist,
  initialize: function() {
    //this.collection.on('add', this.render, this);

  },
  render: function() {
    this.$el.addClass('playlist');

    var context = {
      playlist: this.collection.map(function(song) {
                  return {
                      path: song.get('path'),
                      name: song.get('name')
                    };
      })
    };

    this.$el.html(this.template(context));
  },
  events: {


  }
});


window.app = new App();


window.AppView = Backbone.View.extend({
  tagName: 'div',
  template: window.Templates.application,
  initialize: function(options) {
    this.model.on('change:currentDir', this.switchModel , this);
    this.model.get("currentDir").on("change", this.render, this);
    this.model.get('playlist').on('add', this.render, this);


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
    var context = {
      path: this.model.get('currentDir').get('path')

    };
    this.$el.html(self.template(context));
    (this.sidebarView !== undefined) ? this.sidebarView.remove() : null;
    this.sidebarView = new SidebarFileView({
      model: self.model.get('currentDir')
    });

    this.playlistView = new PlaylistView({
      collection: self.model.get('playlist')
    });




    //this.$el.find('div#sidebar').html(this.sidebarView.render());
    this.sidebarView.setElement('div#sidebar').render();
    this.playlistView.setElement('div#playlist').render();

    this.delegateEvents();
    return this;
  },
  back: function() {


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
    $('body > div#entry-point').html(appView.render().$el);
  });
});


