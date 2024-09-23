import mongoose from "mongoose";

const postSchema =new mongoose.Schema({
    caption: { type: String, default: '' },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    tags: [{ type: String }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isSponsored: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Post = mongoose.model('Post ' , postSchema);