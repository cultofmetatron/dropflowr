module.exports = function(mongoose) {

  //our fair dropbox user, based on the return data from
  //the dropbox api.
  var DropboxUserSchema = new mongoose.Schema({
    uid           :  {type: Number, unique: true },
    id            :  {type: Number, unique: true },
    email         :  {type: String},
    display_name  :  {type: String},
    country       :  {type: String},
    quota_info: {
      shared : Number,
      quota  : Number,
      normal : Number
    }
  });


  //return a user if he exists in our database already
  DropboxUserSchema.statics.findUser = function(uid, callback) {
    return DropboxUser.findOne({
      uid: uid
    }, callback );
  };

  /* findOrCreate takes a user and checks if the user exists,
   * if not it creates one and then passes along the record back up the
   * stack to callback(err, user) is called
   */
  DropboxUserSchema.statics.findOrCreateUser = function(user, callback) {
    console.log('in findOrCreateUser');
    return DropboxUser.findUser(user.uid, function(err, usr) {
      if (!usr) {
        console.log('user was not found, creating one now');
        //user not found so we shall create one
        var newUser = new DropboxUser({
          uid            : user.uid,
          id             : user.id,
          referal_link   : user.referal_link,
          display_name   : user.display_name,
          email          : user.email,
          country        : user.country,
          quota_info     : user.quota_info
        });
        console.log('newUser', newUser);
        newUser.save(function(err) {
          console.log('user was successfuly saved');
          if (err) {return callback(err, null); }
          //save was successful!!
          else { return callback(null, newUser); }
        });
      } else {
        //user exists so we update the validated user's info
        DropboxUser.update({uid: usr.uid}, {
          //referal_link   : user.referal_link,
          display_name   : user.display_name,
          email          : user.email,
          country        : user.country,
          quota_info     : user.quota_info
        }, function(err, numAffected, raw) {
          if (err) {
            console.log('error: ' + err );
          }
          console.log('updated user: ', usr);
          //pass info back up the stack
          return callback(null, usr);
        });
              }
    });
  };

  //create the DropboxUser
  var DropboxUser = mongoose.model('DropboxUser', DropboxUserSchema);

  //return this User type.
  return DropboxUser;

};
