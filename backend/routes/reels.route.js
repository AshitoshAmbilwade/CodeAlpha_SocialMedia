import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addNewReel,
  getAllReels,
  likeReel,
  deleteReel,
  addCommentToReel, // Import the addCommentToReel function
} from "../controllers/reels_controllers.js";

const router = express.Router();

// Route to add a new reel
router
  .route("/addreel")
  .post(isAuthenticated, upload.single("video"), addNewReel);

// Route to get all reels
router.route("/").get(isAuthenticated, getAllReels);

// Route to like/unlike a reel
router.route("/like/:id").post(isAuthenticated, likeReel);

// Route to delete a reel
router.route("/delete/:id").delete(isAuthenticated, deleteReel);

// Route to add a comment to a reel
router.route("/comment/:id").post(isAuthenticated, addCommentToReel); // New route for comments

export default router;
