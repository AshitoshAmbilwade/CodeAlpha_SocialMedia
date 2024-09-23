import {Conversation} from "../models/conversation_models.js";
import {Message} from "../models/message_models.js";
import {User} from "../models/user_models.js"; // Ensure you have this for populating user details

// Send a new message in a conversation
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id; // Assumes sender ID is extracted from authenticated user session
        const receiverId = req.params.id; // Receiver ID passed via route parameters
        const { message } = req.body;

        // Check if both sender and receiver are valid users
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if a conversation exists between sender and receiver
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages"); // Populate messages for easier handling

        // If no conversation exists, create a new one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: [],
                updatedAt: Date.now() // Ensure we track when the conversation was updated
            });
        }

        // Create a new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            isRead: false, // By default, message is unread
            timestamp: Date.now()
        });

        // Push the new message to the conversation
        conversation.messages.push(newMessage._id);
        conversation.updatedAt = Date.now(); // Update the conversation's last activity timestamp

        // Save both conversation and message
        await Promise.all([conversation.save(), newMessage.save()]);

        // Implement socket.io to notify the receiver in real-time (if integrated)

        return res.status(200).json({
            newMessage,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get all messages between two users
export const getMessages = async (req, res) => {
    try {
        const senderId = req.id; // Authenticated user (sender)
        const receiverId = req.params.id; // Receiver ID

        // Find the conversation between the two users
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate({
            path: "messages",
            populate: { path: "senderId", select: "username profilePicture" } // Populate sender details
        });

        // If no conversation exists, return an empty array
        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }

        // Mark messages as read if the authenticated user is the receiver
        const unreadMessages = conversation.messages.filter(
            msg => msg.receiverId.toString() === senderId.toString() && !msg.isRead
        );

        if (unreadMessages.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessages.map(msg => msg._id) } },
                { $set: { isRead: true } }
            );
        }

        return res.status(200).json({
            success: true,
            messages: conversation.messages
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
