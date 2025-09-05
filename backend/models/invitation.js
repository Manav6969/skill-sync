import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Invitation', invitationSchema);
