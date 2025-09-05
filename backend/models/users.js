import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  skills: [String],
  avatar: String,
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  projectlinks: [String],
  googleId: String, 
  refreshToken: String, 
});

export default mongoose.model('User', userSchema);