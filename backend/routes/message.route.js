import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessages, sendMessage } from "../controllers/message_controllers.js";

const router = express.Router();

router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/conversation/:id').get(isAuthenticated, getMessages);

export default router;
