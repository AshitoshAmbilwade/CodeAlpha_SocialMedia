import express from 'express';
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addNewPost,
  getAllPost,
  getUserPost,
  likePost,
  disLikePost,
  savePost,
  addCount,
  getComment,
  deletePost
} from "../controllers/post_controllers.js";

const router = express.Router();

// Add a new post
router.route("/addpost").post(isAuthenticated, upload.single('image'), addNewPost);

// Get all posts
router.route("/all").get(isAuthenticated, getAllPost);

// Get user-specific posts
router.route("/user").get(isAuthenticated, getUserPost);

// Like a post
router.route("/like/:id").post(isAuthenticated, likePost);

// Dislike a post
router.route("/dislike/:id").post(isAuthenticated, disLikePost);

// Save/Unsave a post
router.route("/save/:id").post(isAuthenticated, savePost);

// Add a comment to a post
router.route("/comment/:id").post(isAuthenticated, addCount);

// Get comments for a post
router.route("/comments/:id").get(isAuthenticated, getComment);

// Delete a post
router.route("/delete/:id").delete(isAuthenticated, deletePost);

export default router;
