import mongoose, { Mongoose, Schema } from 'mongoose';

const AllMessageSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    text: {type: String, required: true},
    createdAt: { type: Date, default: Date.now }
})

AllMessageSchema.index({createdAt: -1});

export default mongoose.model('AllMessages', AllMessageSchema);