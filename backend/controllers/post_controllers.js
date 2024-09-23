import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import getDataUrl from "../utils/datauri.js";
import {Post} from "../models/post_models.js";
import  { User } from "../models/user_models.js";
import { Comment } from "../models/comment_models.js";

// Create a new post with mention logic
export const addNewPost = async (req, res) => {
  try {
    const { caption, location, visibility, mentions, tags, isSponsored } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(401).json({ message: "Image required" });
    }

    // Process image using Sharp
    const processedImage = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    // Upload processed image to Cloudinary
    const fileUri = `data:image/jpeg;base64,${processedImage.toString("base64")}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    // Validate and process mentions
    let validMentions = [];
    if (mentions && mentions.length > 0) {
      validMentions = await Promise.all(
        mentions.map(async (userId) => {
          const user = await User.findById(userId);
          if (user) {
            return user._id; // Only valid users are added
          }
          return null;
        })
      );
      validMentions = validMentions.filter((id) => id !== null); // Remove invalid mentions
    }

    // Create a new post
    const post = await Post.create({
      caption,
      mediaUrl: cloudResponse.secure_url,
      mediaType: "image",
      author: authorId,
      location: location || "",
      visibility: visibility || "public",
      mentions: validMentions, // Add valid mentions
      tags: tags || [],
      isSponsored: isSponsored || false,
    });

    // Save post reference to user's posts
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    // Populate author and return the response
    await post.populate({ path: "author", select: "-password" });

    return res.status(200).json({
      message: "Post created successfully",
      success: true,
      post: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get all posts
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture isVerified" })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture isVerified" },
      });
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
  }
};

// Get user-specific posts
export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture isVerified" })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture isVerified" },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });

    // Like logic
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
    }

    await post.save();
    //implementing the socket.io

    return res.status(200).json({
      message: "Post liked/unliked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
//disLike code
export const disLikePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Dislike logic
    if (post.likes.includes(userId)) {
      // If the user has liked the post, remove their like
      post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
    } else {
      return res.status(400).json({
        message: "User has not liked the post",
        success: false,
      });
    }

    await post.save();

    // Implementing socket.io (if needed)
    // socket.emit('post-disliked', { postId, userId }); // Example socket event

    return res.status(200).json({
      message: "Post disliked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};


// Save a post
export const savePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(401).json({
        message: 'Post not found',
        success: false,
      });
    }

    // Fetch the logged-in user
    const user = await User.findById(userId);

    // Check if the post is already saved
    if (user.savedPosts.includes(postId)) {
      // If already saved, unsave it
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId.toString());
      await user.save();
      return res.status(200).json({
        message: "Post unsaved successfully",
        success: true,
      });
    } else {
      // If not saved, save it
      user.savedPosts.push(postId);
      await user.save();
      return res.status(200).json({
        message: "Post saved successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};


//ad comment
export const addCount = async (req, res)=>{
  try {
    const postId = req.params.id;
    const userId= req.id;
    const {text} = req.body;
    const post = await Post.findById(postId);
    if(!text) return res.status(400).json({message:'text is required', success:false});

    const comment = await Comment.create({
      text,
      author:userId,
      post:postId
    }).populate({
      path:'author',
      select:"username , profilePicture"
    });
    post.comment.push(comment._id);
    await post.save();
    
    return res.status(200).json({message:'comment added',comment,success:true})
  } catch (error) {
    console.log(error);
    
  }
};

export const getComment = async(req,res)=>{
  try {
    const postId =req.params.id;
    
    const comments = await Comment.find({post:postId}).populate('author','username', 'profilePicture','isVerified');

    if(!comments) return res.status(404).json({message:'No comment',success:true});

    return res.status(200).json({
      comments,
      success:true
    });
  } catch (error) {
    console.log(error);
    
  }
}
//delete posts
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'No post found', success: false });
    }

    // Check if the logged-in user is the owner of the post
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "You can't delete a post you are not the author of",
        success: false,
      });
    }

    // Delete post
    await Post.findByIdAndDelete(postId);

    // Remove the post ID from the user's post array
    let user = await User.findById(authorId);
    user.posts = user.posts.filter(id => id.toString() !== postId);
    await user.save();

    // Delete associated comments
    await Comment.deleteMany({ post: postId });

    // Delete associated likes (if likes are stored in a separate collection)
    // If likes are stored within the post, this step is not needed since deleting the post already removes the likes
    post.likes = [];
    await post.save();

    return res.status(200).json({ message: 'Post deleted successfully', success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

