import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the reel
  mediaUrl: { type: String, required: true }, // URL to the media (video)
  caption: { type: String, default: '' }, // Caption for the reel
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked the reel
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Comments on the reel
  isLikedByCurrentUser: { type: Boolean, default: false }, // Liked by current user
  createdAt: { type: Date, default: Date.now, expires: '24h' }, // Auto-remove after 24 hours
  visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' }, // Visibility of the reel
});

export const Reel = mongoose.model('Reel', reelSchema);
