import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Team', teamSchema);
