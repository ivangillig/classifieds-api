import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  googleName: {
    type: String,
    required: true,
  },
  profileName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePhoto: {
    type: String,
  },
  phone: {
    type: String,
    required: false,
  },
});

userSchema.statics.findOrCreate = async function (profile) {
  try {
    let user = await this.findOne({ googleId: profile.id });
    const googleName = profile.displayName || "";
    const email =
      profile.emails && profile.emails[0] ? profile.emails[0].value : "";
    const profilePhoto =
      profile.photos && profile.photos[0] ? profile.photos[0].value : "";

    if (user) {
      user.googleName = googleName;
      user.email = email;
      user.profilePhoto = profilePhoto;
      await user.save();
    } else {
      // Create a new user
      user = new this({
        googleName,
        googleId: profile.id,
        profileName: googleName,
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

const User = mongoose.model("User", userSchema);
export default User;
