import express from "express";
import { 
    editProfile, 
    followOrUnfollow, 
    getProfile, 
    getSuggestedUsers, 
    login, 
    logout, 
    register, 
    blockOrReport // Added blockOrReport
} from "../controllers/user_controllers.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// User Authentication Routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);

// User Profile Routes
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);

// Follow/Unfollow User Route
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);

// Block or Report User Route
router.route('/blockOrReport/:id').post(isAuthenticated, blockOrReport);

export default router;
