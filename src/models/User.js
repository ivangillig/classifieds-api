import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  // Otros campos que necesites
});

userSchema.statics.findOrCreate = function findOrCreate(profile, cb) {
  const userObj = new this();
  this.findOne({ googleId: profile.id }, (err, result) => {
    if (!result) {
      userObj.googleId = profile.id;
      // Rellenar otros campos si es necesario
      userObj.save(cb);
    } else {
      cb(err, result);
    }
  });
};

const User = mongoose.model('User', userSchema);
export default User;
