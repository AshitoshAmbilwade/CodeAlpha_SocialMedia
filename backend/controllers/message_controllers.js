import { Conversation } from "../models/conversation_models.js";
import { Message } from "../models/message_models.js";
import { User } from "../models/user_models.js"; // Ensure you have this for populating user details
import { getReceiverSocketId, io } from "../socket/socket.js";

// Send a new message in a conversation
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id; // Extract sender ID from authenticated user session
        const receiverId = req.params.id; // Receiver ID passed via route parameters
        const { textMessage: message } = req.body; // Text message received from the frontend

        console.log(message);

        // Find the conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Establish the conversation if not started yet
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Create a new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(), newMessage.save()]);

        // Implement socket.io for real-time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.status(201).json({
            success: true,
            newMessage
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// Send a new media message in a conversation
export const sendMediaMessage = async (req, res) => {
    try {
        const senderId = req.id; // Extract sender ID from authenticated user session
        const receiverId = req.params.id; // Receiver ID passed via route parameters
        const { textMessage: message } = req.body; // Expect text message in the request
        const mediaUrl = req.file ? req.file.path : null; // Use the file path from multer

        // Find the conversation or create a new one
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Create a new message with media details
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,  // Can be text or an empty string if only media is sent
            mediaUrl, // Store the multimedia URL if provided
            isRead: false // Set as unread when sent
        });

        // Push the new message ID to the conversation
        if (newMessage) conversation.messages.push(newMessage._id);

        // Save the conversation and message
        await Promise.all([conversation.save(), newMessage.save()]);

        // Implement socket.io for real-time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.status(201).json({
            success: true,
            newMessage
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// Get all messages between two users
export const getMessages = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');

        if (!conversation) return res.status(200).json({ success: true, messages: [] });

        return res.status(200).json({ success: true, messages: conversation.messages });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
