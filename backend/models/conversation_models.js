import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true
    },
    messages: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Message',
        default: [] // This ensures that messages is an empty array by default
    }
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
