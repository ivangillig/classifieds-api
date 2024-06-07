import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  profilePhoto: {
    type: String,
  },
  // TODO: Check if other fields are neccesary
});

userSchema.statics.findOrCreate = async function (profile) {
  try {
    let user = await this.findOne({ googleId: profile.id });
    const displayName = profile.displayName || '';
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
    const profilePhoto = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

    if (user) {
      // Update user if exists
      user.displayName = displayName;
      user.email = email;
      user.profilePhoto = profilePhoto;
      // Add fields if neccessary
      await user.save();
    } else {
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
