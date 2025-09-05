import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ team: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
