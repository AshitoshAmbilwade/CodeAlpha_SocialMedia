import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import {Reel} from "../models/reels_model.js";
import {User} from "../models/user_models.js";
import {Comment} from "../models/comment_models.js"; // Ensure you have a Comment model

// Add new reel
export const addNewReel = async (req, res) => {
  try {
    const { caption, visibility } = req.body;
    const video = req.file; // Assuming video file is uploaded
    const userId = req.id;

    if (!video) {
      return res.status(401).json({ message: "Video is required" });
    }

    // Check video duration (example: assuming you have a way to get the duration)
    const duration = await getVideoDuration(video.buffer); // Implement this function
    if (duration > 60) {
      return res.status(400).json({ message: "Reel duration must be 60 seconds or less." });
    }

    // Process video using Sharp (optional: if you need to resize or compress)
    const processedVideo = await sharp(video.buffer)
      .resize({ width: 800 }) // Adjust based on your requirements
      .toFormat("mp4") // Convert to MP4 format
      .toBuffer();
    
    // Upload processed video to Cloudinary
    const fileUri = `data:video/mp4;base64,${processedVideo.toString("base64")}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri, { resource_type: "video" });

    // Create a new reel
    const reel = await Reel.create({
      user: userId,
      mediaUrl: cloudResponse.secure_url,
      caption: caption || "",
      visibility: visibility || "public",
    });

    // Save reel reference to user's reels
    const user = await User.findById(userId);
    if (user) {
      user.reels.push(reel._id);
      await user.save();
    }

    return res.status(200).json({
      message: "Reel created successfully",
      success: true,
      reel,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get all reels
export const getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username profilePicture isVerified" })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture isVerified" },
      });

    return res.status(200).json({
      success: true,
      reels,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Like a reel
export const likeReel = async (req, res) => {
  try {
    const userId = req.id;
    const reelId = req.params.id;
    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({ message: "Reel not found", success: false });
    }

    if (!reel.likes.includes(userId)) {
      reel.likes.push(userId);
    } else {
      reel.likes = reel.likes.filter((like) => like.toString() !== userId.toString());
    }

    await reel.save();

    return res.status(200).json({
      message: "Reel liked/unliked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Comment on a reel
export const addCommentToReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required", success: false });
    }

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found", success: false });
    }

    // Add comment logic (assuming you have a Comment model)
    const comment = await Comment.create({
      text,
      author: userId,
      reel: reelId,
    });

    reel.comments.push(comment._id);
    await reel.save();

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

// Delete a reel
export const deleteReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.id;

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "No reel found", success: false });
    }

    // Check if the logged-in user is the owner of the reel
    if (reel.user.toString() !== userId) {
      return res.status(403).json({
        message: "You can't delete a reel you are not the author of",
        success: false,
      });
    }

    // Delete reel
    await Reel.findByIdAndDelete(reelId);

    // Remove the reel ID from the user's reels array
    let user = await User.findById(userId);
    user.reels = user.reels.filter(id => id.toString() !== reelId);
    await user.save();

    // Delete associated comments
    await Comment.deleteMany({ reel: reelId });

    return res.status(200).json({ message: "Reel deleted successfully", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
