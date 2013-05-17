
/*everyauth is configured here */

module.exports = function(everyauth, DropboxUser, configs) {


  //everyauth configuration
  everyauth.everymodule.userPkey('uid');
  everyauth.everymodule.findUserById( function (userId, callback) {
  //  User.findById(userId, callback);
  // callback has the signature, function (err, user) {...}
  //}
    DropboxUser.findUser(userId, function(err, user) {
      callback(err, user);
    });
  });

  everyauth.dropbox
    .consumerKey(configs.db_consumerKey)
    .consumerSecret(configs.db_consumerSecret)
    .findOrCreateUser(function (sess, accessToken, accessSecret, user) {
      console.log('session', sess);
      //login to database logic goes here!!
      var promise = this.Promise();
      DropboxUser.findOrCreateUser(user, function(err, user) {
        if (user) {
          //user was either found or created and we can create the session
          sess.dropboxTokens = {
            accessToken: accessToken,
            accessSecret: accessSecret
          };

          promise.fulfill(user);
      } else {
        console.log('##############there was an error!!! ###################');
        return promise.fulfill({uid: 0 });
      }
    });
    return promise;
  })
  .redirectPath('/');

};




