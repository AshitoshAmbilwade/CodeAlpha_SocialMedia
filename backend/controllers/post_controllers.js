import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import getDataUrl from "../utils/datauri.js";
import {Post} from "../models/post_models.js";
import  { User } from "../models/user_models.js";
import { Comment } from "../models/comment_models.js";
import { getReceiverSocketId, io } from "../socket/socket.js";


export const addNewPost = async (req, res) => {
  try {
      const { caption } = req.body;
      const image = req.file;
      const authorId = req.id;

      if (!image) return res.status(400).json({ message: 'Image required' });

      // image upload 
      const optimizedImageBuffer = await sharp(image.buffer)
          .resize({ width: 800, height: 800, fit: 'inside' })
          .toFormat('jpeg', { quality: 80 })
          .toBuffer();

      // buffer to data uri
      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      const post = await Post.create({
          caption,
          image: cloudResponse.secure_url,
          author: authorId
      });
      const user = await User.findById(authorId);
      if (user) {
          user.posts.push(post._id);
          await user.save();
      }

      await post.populate({ path: 'author', select: '-password' });

      return res.status(201).json({
          message: 'New post added',
          post,
          success: true,
      })

  } catch (error) {
      console.log(error);
  }
}


// Get all posts
export const getAllPost = async (req, res) => {
  try {
      const posts = await Post.find().sort({ createdAt: -1 })
          .populate({ path: 'author', select: 'username profilePicture' })
          .populate({
              path: 'comments',
              sort: { createdAt: -1 },
              populate: {
                  path: 'author',
                  select: 'username profilePicture'
              }
          });
      return res.status(200).json({
          posts,
          success: true
      })
  } catch (error) {
      console.log(error);
  }
};

// Get user-specific posts
export const getUserPost = async (req, res) => {
  try {
      const authorId = req.id;
      const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
          path: 'author',
          select: 'username, profilePicture'
      }).populate({
          path: 'comments',
          sort: { createdAt: -1 },
          populate: {
              path: 'author',
              select: 'username, profilePicture'
          }
      });
      return res.status(200).json({
          posts,
          success: true
      })
  } catch (error) {
      console.log(error);
  }
}

// Like a post
export const likePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });

    // like logic started
    await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
    await post.save();

     // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

    return res.status(200).json({
      message: "Post liked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
//disLike code
export const disLikePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

     // like logic started
     await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
     await post.save();

     // implement socket io for real time notification
     const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
     const postOwnerId = post.author.toString();
     if(postOwnerId !== likeKrneWalaUserKiId){
         // emit a notification event
         const notification = {
             type:'dislike',
             userId:likeKrneWalaUserKiId,
             userDetails:user,
             postId,
             message:'Your post was liked'
         }
         const postOwnerSocketId = getReceiverSocketId(postOwnerId);
         io.to(postOwnerSocketId).emit('notification', notification);
     }
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
    if (user.bookmarks.includes(postId)) {
      // If already saved, unsave it
      await user.updateOne({$pull:{bookmarks:post._id}});
      await user.save();
      return res.status(200).json({
        message: "Post unsaved successfully",
        success: true,
      });
    } else {
      // If not saved, save it
      await user.updateOne({$addToSet:{bookmarks:post._id}});
      //user.savedPosts.push(postId);
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
    })
    await comment.populate({
      path:'author',
      select:"username profilePicture"
  });
  
  post.comments.push(comment._id);
  await post.save();
    
    return res.status(200).json({message:'comment added',comment,success:true})
  } catch (error) {
    console.log(error);
    
  }
};

export const getComment = async(req,res)=>{
  try {
    const postId =req.params.id;
    
    const comments = await Comment.find({post:postId}).populate('author','username', 'profilePicture');

    if(!comments) return res.status(404).json({message:'No comment',success:false});

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
    if(!post) return res.status(404).json({message:'Post not found', success:false});

    // check if the logged-in user is the owner of the post
    if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

    // delete post
    await Post.findByIdAndDelete(postId);

    // remove the post id from the user's post
    let user = await User.findById(authorId);
    user.posts = user.posts.filter(id => id.toString() !== postId);
    await user.save();

    // delete associated comments
    await Comment.deleteMany({post:postId});

    return res.status(200).json({
        success:true,
        message:'Post deleted'
    })

} catch (error) {
    console.log(error);
}
};