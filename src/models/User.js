import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
});

userSchema.statics.findOrCreate = async function (profile) {
  let user = await this.findOne({ googleId: profile.id });
  if (!user) {
    user = new this({ googleId: profile.id });
    await user.save();
  }
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
