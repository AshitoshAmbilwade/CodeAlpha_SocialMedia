import { User } from "../models/user_models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import { Post } from "../models/post_models.js";
import cloudinary from "../utils/cloudinary.js";

//for register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(402).json({
        message: "Email already in use. Try a different email or login.",
        success: false,
      });
    }
    // Check if username is already in use
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(403).json({
        message: "Username already in use. Please choose another.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};

//now for login

// Now for login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(402).json({
        message: "Incorrect email or Password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(402).json({
        message: "Incorrect email or Password",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "3d",
    });

    // Utility function to populate items (posts, stories, reels)
    const populateItems = async (itemIds) => {
      return Promise.all(
        itemIds.map(async (itemId) => {
          const item = await Post.findById(itemId); // Change to Story or Reel model as needed
          return item && item.author.equals(user._id) ? item : null;
        })
      );
    };

    const populatedPosts = await populateItems(user.posts);
    const populatedStories = await populateItems(user.stories); // Adjust as necessary
    const populatedReels = await populateItems(user.reels); // Adjust as necessary

    const responseUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts.filter(Boolean), // Filter out nulls
      storyHighlights: user.storyHighlights,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      reels: populatedReels.filter(Boolean), // Filter out nulls
      stories: populatedStories.filter(Boolean), // Filter out nulls
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: responseUser,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//log out
export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//get profile
export const getProfile = async (req, res) => {
  try {
      const userId = req.params.id;
      let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
      return res.status(200).json({
          user,
          success: true
      });
  } catch (error) {
      console.log(error);
  }
};

//edit profile
export const editProfile = async (req, res) => {
 try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};

//suggested user
export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "add users",
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
  }
};

//follow or unfollow
export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;
    const jiskoFollowKrunga = req.params.id;
    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You can't follow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not Found",
        success: false,
      });
    }
    // now check follow or unfollow

    const isFollowing = user.following.includes(jiskoFollowKrunga);
    if (isFollowing) {
      //already follow so unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
      });
    } else {
      // follow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      return res.status(200).json({
        message: "followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Block or report a user (new feature)
// Block or unblock a user with optional reporting
// Block or Unblock a user
export const blockOrReport = async (req, res) => {
  try {
    const userId = req.id; // Get the current user's ID from the request
    const targetUserId = req.params.id; // Extract target user ID from URL parameters

    // Prevent blocking/unblocking oneself
    if (userId === targetUserId) {
      return res.status(400).json({
        message: "You can't block/unblock yourself",
        success: false,
      });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if the user has blocked the target user
    const isBlocked = user.blockedUsers.includes(targetUserId);

    if (isBlocked) {
      // User is already blocked, so unblock logic
      user.blockedUsers = user.blockedUsers.filter(
        (id) => id.toString() !== targetUserId
      );
      await user.save();
      return res.status(200).json({
        message: "User unblocked successfully",
        success: true,
      });
    } else {
      // User is not blocked, so block logic
      user.blockedUsers.push(targetUserId);
      await user.save();
      return res.status(200).json({
        message: "User blocked successfully",
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
