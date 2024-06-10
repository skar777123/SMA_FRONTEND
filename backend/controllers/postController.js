import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
  try {
    const { id, image, caption } = req.body;
    if (!id || !image || !caption) {
      res.status(401).json({
        message: "All fields are required",
      });
    }
    const user = await User.findById(id).select("-password");
    const creationPost = await Post.create({
      userId: id,
      caption,
      image,
    });
    const created = await User.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          type: Array,
          post: creationPost._id,
        },
      }
    );
    if (!created) {
      res.status(400).json({
        message: "Post not created ",
      });
    }
    res.status(200).json({
      message: "Post created",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const id = req.user._id;
    const { postId } = req.body;
    if (!id || !postId) {
      res.status(401).json({
        message: "ID's is required",
      });
    }
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(400).json({
        message: "Post is not able to deleted",
      });
    }
    if (user.post.includes(postId)) {
      user.post.pop(postId);
    }
    await user.save();

    //post delete
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      res.status(400).json({
        message: "Post is not able to deleted",
      });
    }
    res.status(200).json({
      message: "Post Deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};