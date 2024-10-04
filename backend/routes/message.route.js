import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessages, sendMessage,sendMediaMessage } from "../controllers/message_controllers.js";

const router = express.Router();

// Route for sending a text message
router.post('/send/:id', isAuthenticated, sendMessage);

// Route for getting all messages in a conversation
router.get('/all/:id', isAuthenticated, getMessages);

// Route for sending a media message (with file upload)
router.post('/media/:id', isAuthenticated, upload.single('mediaFile'), sendMediaMessage); // Changed 'media' to 'mediaFile' to match frontend input name

export default router;
