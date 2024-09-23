import {Story} from '../models/story_model.js'; // Import the Story model
import {User} from '../models/user_models.js'; // Import the User model
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { Comment } from '../models/comment_models.js';

// Create a new story
export const addNewStory = async (req, res) => {
  try {
    const { caption } = req.body;
    const mediaFile = req.file; // Use a single file input for both image and video
    const userId = req.id;

    if (!mediaFile) {
      return res.status(400).json({ message: "Media file required" });
    }

    let mediaUrl;

    // Process image if the uploaded file is an image
    if (mediaFile.mimetype.startsWith('image/')) {
      const processedImage = await sharp(mediaFile.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      const fileUri = `data:image/jpeg;base64,${processedImage.toString("base64")}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      mediaUrl = cloudResponse.secure_url;

    } else if (mediaFile.mimetype.startsWith('video/')) {
      // Directly upload video to Cloudinary without processing
      const fileUri = `data:video/mp4;base64,${mediaFile.buffer.toString("base64")}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri, {
        resource_type: 'video',
      });
      mediaUrl = cloudResponse.secure_url;

    } else {
      return res.status(400).json({ message: "Invalid media type. Only images and videos are allowed." });
    }

    // Create a new story
    const story = await Story.create({
      user: userId,
      mediaUrl,
      caption: caption || '',
    });

    return res.status(201).json({
      message: "Story created successfully",
      success: true,
      story,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get all stories for a user
export const getUserStories = async (req, res) => {
  try {
    const userId = req.id;

    const stories = await Story.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username profilePicture" });

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// View a specific story
export const viewStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.id;

    const story = await Story.findById(storyId).populate('user', 'username profilePicture');
    if (!story) {
      return res.status(404).json({ message: "Story not found", success: false });
    }

    // Add viewer if not already viewed
    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }

    return res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Comment on a story
export const addCommentToStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required", success: false });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found", success: false });
    }

    // Add comment logic (assuming you have a Comment model)
    const comment = await Comment.create({
      text,
      author: userId,
      story: storyId,
    });

    story.comments.push(comment._id);
    await story.save();

    return res.status(200).json({
      message: "Comment added successfully",
      success: true,
      comment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Delete a story
export const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "No story found", success: false });
    }

    // Check if the logged-in user is the owner of the story
    if (story.user.toString() !== userId) {
      return res.status(403).json({
        message: "You can't delete a story you are not the author of",
        success: false,
      });
    }

    // Delete story
    await Story.findByIdAndDelete(storyId);

    return res.status(200).json({ message: 'Story deleted successfully', success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

// Auto-delete expired stories (to be called periodically, e.g., using a cron job)
export const autoDeleteExpiredStories = async () => {
  try {
    const currentDate = new Date();
    await Story.deleteMany({ createdAt: { $lt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) } });
    console.log("Expired stories deleted successfully");
  } catch (error) {
    console.log("Error deleting expired stories:", error);
  }
};
