import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import {
  addNewStory,
  getUserStories,
  viewStory,
  addCommentToStory,
  deleteStory,
  autoDeleteExpiredStories
} from '../controllers/story_controllers.js';

const router = express.Router();

// Route to add a new story (single file upload for both images and videos)
router.route('/addstory').post(isAuthenticated, upload.single('media'), addNewStory);

// Route to get all stories for a user
router.route('/').get(isAuthenticated, getUserStories);

// Route to view a specific story
router.route('/view/:id').get(isAuthenticated, viewStory);

// Route to comment on a story
router.route('/comment/:id').post(isAuthenticated, addCommentToStory);

// Route to delete a story
router.route('/delete/:id').delete(isAuthenticated, deleteStory);

// Route to auto-delete expired stories (e.g., use this in a cron job)
router.route('/autodelete').delete(autoDeleteExpiredStories);

export default router;
