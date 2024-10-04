import mongoose from "mongoose";

const messageSchema= new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    media: { type: String, default: '' },
    message: {
        type: String,
        trim: true 
    },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', 'file'], default: null },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Message = mongoose.model('Message' , messageSchema);