//controllers

App.DirectoryController = Ember.ObjectController.extend({
  size: (function() {
    console.log('this is why we can\'t have nice things');
    var stats = this.get('content.currentDir').get('stats');
    console.log('' + stats);
    return ''+ stats;

  }).property('content.currentDir')
});






