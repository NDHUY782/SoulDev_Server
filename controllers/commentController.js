const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const PostsModel = require("../models/PostsSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const UserModel = require("../models/UserSchema");
const CommentModel = require("../models/CommentSchema");
const PostModel = require("../models/PostsSchema");
const novu = require("../config/novu");

dotenv.config();
const getComments = async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const data = await CommentModel.findOne({ post_id: post_id }).populate(
      "post_id",
    );

    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
// const add_comment = async (req, res) => {
//   try {
//     const posts_id = req.params.posts_id;
//     const postsData = await PostsModel.findById(posts_id);
//     if (postsData) {
//       const user_id = req.user._id;
//       const userData = await UserModel.findById(user_id);
//       if (userData) {
//         const newComment = {
//           text: req.body.text,
//           name: `${userData.first_name}${userData.last_name}`,
//           avatar: `${userData.image}`,
//           user_id: userData._id,
//         };

//         postsData.comments.unshift(newComment);
//         await postsData.save();
//         res
//           .status(200)
//           .send({ success: true, data: postsData.comments.user_id });
//       } else {
//         res.status(400).send({ success: false, msg: error.message });
//       }
//     } else {
//       res.status(400).send({ success: false, msg: error.message });
//     }
//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// };

const add_comment = async (req, res) => {
  try {
    const posts_id = req.params.posts_id;
    const postsData = await PostsModel.findById(posts_id);
    if (postsData) {
      const user_id = req.user._id;
      const userData = await UserModel.findById(user_id);
      if (userData) {
        const files = req.files; // Sử dụng req.files thay vì req.file
        const imageUrls = [];

        for (const file of files) {
          const imageBase64 = await getBase64(file.path);
          const image = await cloudinary.uploadCloudinary(
            `data:${file.mimetype};base64,${imageBase64}`,
            file.filename.split(".")[0],
          );
          imageUrls.push(image);
        }
        const comment = new CommentModel({
          text: req.body.text,
          image: imageUrls,
          user_id: user_id,
          post_id: posts_id,
        });
        const commentData = await comment.save();

        const userProfile = await UserModel.findOne({
          _id: user_id,
        });
        if (!userProfile) {
          return res.status(500).send({
            success: false,
            msg: "Không tìm thấy hồ sơ của user",
          });
        }
        const data = await PostsModel.findById(posts_id);
        await novu.trigger("comment-post-notification", {
          to: {
            subscriberId: data.user_id.toString(),
          },
          payload: {
            image: userProfile.image,
            title: `${userProfile.first_name} ${userProfile.last_name} đã bình luận bài viết của bạn`,
            url: `/post/${postsData._id}`,
            type: "success",
          },
        });
        res.status(200).send({ success: true, data: commentData });
      } else {
        res
          .status(400)
          .send({ success: false, msg: "Chưa có comment bài post này" });
      }
    } else {
      res.status(400).send({ success: false, msg: "không có bài post này" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const delete_comment = async (req, res) => {
  try {
    const posts_id = req.params.posts_id;
    const user_id = req.user._id;
    const comment_id = req.params.comment_id;

    const commentData = await CommentModel.findOneAndDelete({
      user_id: user_id,
      post_id: posts_id,
      _id: comment_id,
    });
    return res.status(200).send({ success: true, msg: "Đã Xóa" });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const update_comment = async (req, res) => {
  try {
    const posts_id = req.params.posts_id;
    const postsData = await PostsModel.findById(posts_id);
    if (postsData) {
      const user_id = req.user._id;
      const userData = await UserModel.findById(user_id);
      if (userData) {
        const comment_id = req.params.comment_id;
        const updateData = await CommentModel.findOne({
          _id: comment_id,
          post_id: posts_id,
          user_id: user_id,
        });
        if (updateData) {
          // const { text } = req.body;
          // const updateCommentData = {
          //     text
          // };
          const data = await CommentModel.findByIdAndUpdate(
            { _id: comment_id },
            {
              $set: {
                text: req.body.text,
              },
            },
            { new: true },
          );
          return res.status(200).send({ success: true, userData: data });
        } else {
          res
            .status(400)
            .send({ success: false, msg: "User không được chỉnh sửa Cmt" });
        }
      } else {
        res
          .status(400)
          .send({ success: false, msg: "User chưa comment bài post này" });
      }
    } else {
      res.status(400).send({ success: false, msg: "Không có bài post" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const update_commentImage = async (req, res) => {
  try {
    const posts_id = req.params.posts_id;
    const user_id = req.user._id;
    const comment_id = req.params.comment_id;
    const updateCommentImage = await CommentModel.findOne({
      _id: comment_id,
      post_id: posts_id,
      user_id: user_id,
    });
    if (updateCommentImage) {
      const files = req.files;
      const imageUrls = [];

      for (const file of files) {
        const imageBase64 = await getBase64(file.path);
        const image = await cloudinary.uploadCloudinary(
          `data:${file.mimetype};base64,${imageBase64}`,
          file.filename.split(".")[0],
        );
        imageUrls.push(image);
      }
      const data = await CommentModel.findByIdAndUpdate(
        { _id: comment_id },
        {
          $set: {
            image: imageUrls,
          },
        },
        { new: true },
      );
      return res.status(200).send({ success: true, data: data });
    } else {
      res
        .status(400)
        .send({ success: false, msg: "User không được chỉnh sửa Cmt" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
module.exports = {
  getComments,
  add_comment,
  delete_comment,
  update_comment,
  update_commentImage,
};
