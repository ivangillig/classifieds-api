import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePhoto: {
    type: String,
  },
});

userSchema.statics.findOrCreate = async function (profile) {
  try {
    let user = await this.findOne({ googleId: profile.id });
    const displayName = profile.displayName || '';
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
    const profilePhoto = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

    if (user) {
      // Update user if exist
      user.displayName = displayName;
      user.email = email;
      user.profilePhoto = profilePhoto;
      await user.save();
    } else {
      // Create a new user
      user = new this({
        googleId: profile.id,
        displayName: displayName,
        email: email,
        profilePhoto: profilePhoto,
      });
      await user.save();
    }
    return user;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model('User', userSchema);
export default User;
