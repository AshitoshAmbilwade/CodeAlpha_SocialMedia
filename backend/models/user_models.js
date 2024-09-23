import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'trans'] },
    isPrivate: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
    // Arrays for followers, followings, posts, savedPosts
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    storyHighlights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added blocked users
    reportedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added reported users
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    stories: [{    type: mongoose.Schema.Types.ObjectId,    ref: 'Story'}],
    reels: [{    type: mongoose.Schema.Types.ObjectId,    ref: 'reels'}],
});

export const User = mongoose.model('User', userSchema);
