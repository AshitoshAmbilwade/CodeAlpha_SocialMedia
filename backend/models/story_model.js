import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the story
    mediaUrl: { type: String, required: true }, // URL to the media (photo, video)
    caption: { type: String, default: '' }, // Caption for the story
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have viewed the story
    isHighlight: { type: Boolean, default: false }, // Whether the story is a highlight or not
    createdAt: { type: Date, default: Date.now, expires: '24h' } // Auto-remove after 24 hours
});

export const Story = mongoose.model('Story', storySchema);
