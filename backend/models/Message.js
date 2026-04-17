import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { 
            type: String, 
            required: true,
            validate: {
                validator: function(v) {
                    return /^[A-Za-z0-9+/=]+$/.test(v);
                },
                message: 'Message text must be Base64 encoded ciphertext'
            }
        },
        encrypted: {
            type: Boolean,
            default: true  // flags that this message is E2EE encrypted
        }
    },
    { timestamps: true }
);

messageSchema.index({ team: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
