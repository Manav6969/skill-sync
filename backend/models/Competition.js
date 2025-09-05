import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  team: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Competition', competitionSchema);
