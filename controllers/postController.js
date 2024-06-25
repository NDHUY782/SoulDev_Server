const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const novu = require("../config/novu");
const PostsModel = require("../models/PostsSchema");
const CommentModel = require("../models/CommentSchema");
const UserModel = require("../models/UserSchema");
const GroupMediaModel = require("../models/GroupMediaSchema");
const PageModel = require("../models/PageSchema");
dotenv.config();

const getListPosts = async (req, res) => {
  const user_id = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";

  const pageSize = Number(process.env.PAGE_SIZE || 10);

  let query = {};
  if (keyword) {
    query = {
      $or: [{ text: keyword }],
    };
  }

  try {
    // Lấy các nhóm mà người dùng là thành viên
    const userGroups = await GroupMediaModel.find({
      "members.user_id": user_id,
    })
      .select("_id")
      .exec();
    const groupIds = userGroups.map((group) => group._id);

    // Lấy các page mà người dùng có theo dõi
    const userPages = await PageModel.find({
      "followers.user_id": user_id,
    })
      .select("_id")
      .exec();
    const pageIds = userPages.map((page) => page._id);

    query = {
      ...query,
      $or: [
        { group_id: { $in: groupIds } },
        { page_id: { $in: pageIds } },
        { user_id: { $ne: null } },
      ],
    };

    const data = await PostsModel.find(query)
      .populate("page_id")
      .populate("likes.user_id")
      .populate("user_id")
      .sort({ created: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const postIds = data.map((post) => post._id.toString());
    const comments = await CommentModel.find({
      post_id: { $in: postIds },
    }).exec();

    // Đếm số bình luận theo post_id
    const commentsCountByPostId = postIds.reduce((acc, postId) => {
      const postComments = comments.filter(
        (comment) => comment.post_id.toString() === postId,
      );
      acc[postId] = {
        count: postComments.length,
      };
      return acc;
    }, {});

    // Đính kèm số bình luận vào mỗi bài viết
    const postsWithCommentCount = data.map((post) => ({
      ...post.toObject(),
      commentsCount: commentsCountByPostId[post._id.toString()]?.count || 0,
    }));

    const rowCount = await PostsModel.find(query).countDocuments().exec();
    const totalPage = Math.ceil(rowCount / pageSize);

    res.status(200).json({
      totalPage,
      page,
      pageSize,
      items: postsWithCommentCount,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false });
  }
};

const getPostById = async (req, res) => {
  try {
    const post_id = req.params.post_id;

    const getComments = await CommentModel.find({ post_id: post_id }).populate(
      "user_id",
      "first_name last_name image",
    );

    const dataByPostsId = await PostsModel.findById(post_id)
      .populate("page_id")
      .populate("group_id")
      .populate("likes.user_id")
      .populate("user_id")
      .exec();

    return res.status(200).send({
      success: true,
      post_data: dataByPostsId,
      comment_data: getComments,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getListPostsByCurrentUserId = async (req, res) => {
  try {
    const user_id = req.user._id;

    const dataByUserId = await PostsModel.find({ user_id })
      .populate("page_id")
      .populate("group_id")
      .populate("user_id")
      .populate("likes.user_id")
      .sort({ created: -1 });

    res.status(200).send({ success: true, data: dataByUserId });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const getListPostsByUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const dataByUserId = await PostsModel.find({ user_id })
      .populate("page_id")
      .populate("group_id")
      .populate("user_id")
      .populate("likes.user_id")
      .sort({ created: -1 });

    res.status(200).send({ success: true, data: dataByUserId });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};

// const getPostByPagination = async (req, res) => {
//   try {
//     const posts = await PostsModel.find().sort({ created: -1 });
//     res.status(200).send({ success: true, data: posts });
//   } catch (error) {
//     res.status(400).send({ success: false });
//   }
// };

//------------Thêm bài viết
const add_post = async (req, res) => {
  try {
    // const user_id = req.params.user_id;
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

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

    const postData = new PostsModel({
      user_id: req.user._id,
      images: imageUrls, // Lưu danh sách các URL hình ảnh
      ...req.body,
    });

    const data = await postData.save();

    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//----------Update post
const update_post = async (req, res) => {
  try {
    const { tittle, name, content } = req.body;
    const updateData = {
      tittle,
      name,
      content,
    };
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id);

    const postsID = req.params.posts_id;

    const updatePostsData = await PostsModel.findOne({
      user_id: user_id,
      _id: postsID,
    });
    if (updatePostsData) {
      const data = await PostsModel.findByIdAndUpdate(
        { _id: postsID },
        {
          $set: updateData,
        },
        { new: true },
      );
      return res.status(200).send({ success: true, userData: data });
    } else {
      res.status(400).send({ success: false, msg: error.message });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//----------Update multi image
const update_post_image = async (req, res) => {
  try {
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

    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id);

    const postsID = req.params.posts_id;
    const postsData = await PostsModel.findById(postsID);

    const updatePostsImage = await PostsModel.findOne({
      user_id: user_id,
      _id: postsID,
    });

    if (updatePostsImage) {
      const data = await PostsModel.findByIdAndUpdate(
        { _id: postsID },
        {
          $set: {
            images: imageUrls,
          },
        },
        { new: true },
      );
      return res.status(200).send({ success: true, userData: data });
    } else {
      res.status(400).send({ success: false, msg: error.message });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const like_post = async (req, res) => {
  try {
    const user_id = req.user._id;

    const postsID = req.params.posts_id;
    const postsData = await PostsModel.findById(postsID);
    if (postsData) {
      if (postsData.likes.some((like) => like.user_id.toString() === user_id)) {
        res.status(400).send({ success: false, msg: "Đã được like" });
      } else {
        postsData.likes.unshift({ user_id: user_id });
        await postsData.save();

        const userProfile = await UserModel.findOne({
          _id: user_id,
        });
        if (!userProfile) {
          return res.status(500).send({
            success: false,
            msg: "Không tìm thấy hồ sơ của user",
          });
        }

        await novu.trigger("like-post-notification", {
          to: {
            subscriberId: postsData.user_id.toString(),
          },
          payload: {
            image: userProfile.image,
            title: `${userProfile.first_name} ${userProfile.last_name} đã like bài viết`,
            url: `/post/${postsID}`,
            type: "success",
          },
        });
        console.log(userProfile.first_name);
        res.status(200).send({ success: true, data: postsData });
      }
    } else {
      res.status(400).send({ success: false, msg: "Không có bài viết này" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const unlike_post = async (req, res) => {
  try {
    const user_id = req.user._id;

    const postsID = req.params.posts_id;
    const postsData = await PostsModel.findById(postsID);
    if (postsData) {
      if (
        !postsData.likes.some((like) => like.user_id.toString() === user_id)
      ) {
        res.status(400).send({ success: false, msg: "Chưa được like" });
      } else {
        postsData.likes = postsData.likes.filter(
          (like) => like.user_id.toString() !== user_id,
        );
        await postsData.save();
        res.status(200).send({ success: true, data: postsData });
        // return postsData.likes;
      }
    } else {
      res.status(400).send({ success: false, msg: "Không có bài viết này" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

// const add_comment = async (req, res) => {
//   try {
//     const posts_id = req.params.posts_id;
//     const postsData = await PostsModel.findById(posts_id);
//     if (postsData) {
//       const user_id = req.params.user_id;
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
// const delete_comment = async (req, res) => {
//   try {

//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// };

// const update_comment = async(req,res) => {
//   try {
//     const user_id = req.params.user_id;
//     const userData = UserModel.findById(user_id)
//     const comment_id =req.params.comment_id

//     const postsID = req.params.posts_id;
//     const postsData = await PostsModel.findById(postsID);
//     if (postsData) {
//       if (postsData.comments.some((comment) => comment.user_id === user_id)) {

//         if (postsData.comments.some((comment) => comment._id === comment_id)) {
//           console.log(comment_id)
//         } else {
//           res.status(400).send({ success: false, msg: "Không tìm thấy comment" });
//         }

//       } else {
//         res.status(400).send({success:false,msg: 'User chưa comment' })
//       };
//     } else {
//       res.status(400).send({ success: false, msg: error.message });
//     }

//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// }

//-----------Get all list share
// const all_ListShare = async(req,res) => {
//   try {

//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// }
const share_post = async (req, res) => {
  try {
    const user_id = req.user._id;
    const postsID = req.params.posts_id;

    const postsData = await PostsModel.findById(postsID);
    if (postsData) {
      if (!postsData.shares) postsData.shares = [];

      postsData.shares.unshift({
        user_id: user_id,
        description: req.body.description,
      });

      await postsData.save();
      const userProfile = await UserModel.findOne({
        _id: user_id,
      });
      if (!userProfile) {
        return res.status(500).send({
          success: false,
          msg: "Không tìm thấy hồ sơ của user",
        });
      }

      await novu.trigger("share-post-notification", {
        to: {
          subscriberId: postsData.user_id.toString(),
        },
        // payload: 'Có người đã like bài viết của bạn!'
        payload: {
          image: userProfile.image,
          title: `${userProfile.first_name} ${userProfile.last_name} đã share bài viết của bạn`,
          url: `/post/${postsID}`,
          type: "success",
        },
      });
      return res.status(200).send({ success: true, data: postsData.shares });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Không có bài viết này" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const remove_share_post = async (req, res) => {
  try {
    const user_id = req.user._id;

    const postsID = req.params.posts_id;
    const postsData = await PostsModel.findById(postsID);
    if (postsData) {
      if (
        postsData.shares &&
        !postsData.shares.some((share) => share.user_id.toString() === user_id)
      ) {
        res.status(400).send({ success: false, msg: "Chưa được share" });
      } else {
        if (!postsData.shares) postsData.shares = [];
        postsData.shares = postsData.shares.filter(
          (share) => share.user_id.toString() !== user_id,
        );
        await postsData.save();
        res.status(200).send({ success: true, data: postsData.shares });
        // return postsData.shares;
      }
    } else {
      res.status(400).send({ success: false, msg: "Không có bài viết này" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const get_random_post = async (req, res) => {
  try {
    const allPosts = await PostsModel.find();
    // Lấy số lượng bài post
    const postCount = allPosts.length;

    const randomIndexes = [];
    while (randomIndexes.length < postCount) {
      const randomIndex = Math.floor(Math.random() * postCount);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }

    const randomPosts = randomIndexes.map((index) => allPosts[index]);

    res.json(randomPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const countMyPosts = async (req, res) => {
  try {
    const data = await PostsModel.countDocuments({ user_id: req.user._id });

    return res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const getMyPostsShared = async (req, res) => {
  try {
    const user_id = req.user._id;

    const postsData = await PostsModel.find({ "shares.user_id": user_id })
      .populate("user_id")
      .populate("likes.user_id")
      .sort({ "shares.createdAt": -1 });

    res.status(200).send({ success: true, data: postsData });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const getListUsersLikePost = async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const postData =
      await PostsModel.findById(post_id).populate("likes.user_id");
    if (!postData) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not post for your target" });
    }
    const userProfile = postData.likes;

    res.status(200).send({ success: true, listUsers: userProfile });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//Search Post
const searchPosts = async (req, res) => {
  const user_id = req.user._id;
  const search = req.body.search;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "Profile not exist" });
    }
    const posts = await PostsModel.find({
      content: { $regex: search, $options: "i" },
    })
      .populate("page_id")
      .populate("group_id")
      .populate("user_id")
      .populate("id_category")
      .populate("likes.user_id")
      .populate("shares.user_id");

    res.status(200).send({ success: true, data: posts });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
//Search All
const searchAll = async (req, res) => {
  try {
    const search = req.body.search;
    if (!search) {
      return res.status(400).send("search is required");
    }

    const users = UserModel.find({
      $or: [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
      ],
    });

    const posts = PostsModel.find({
      $or: [
        { tittle: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    })
      .populate("page_id")
      .populate("group_id")
      .populate("user_id")
      .populate("id_category")
      .populate("likes.user_id")
      .populate("shares.user_id");

    const pages = PageModel.find({
      name: { $regex: search, $options: "i" },
    });

    const groups = GroupMediaModel.find({
      name: { $regex: search, $options: "i" },
    });

    const results = await Promise.all([users, posts, pages, groups]);

    res.json({
      users: results[0],
      posts: results[1],
      pages: results[2],
      groups: results[3],
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
};
module.exports = {
  getListPosts,
  get_random_post,
  getListPostsByCurrentUserId,
  getListPostsByUserId,
  getPostById,
  add_post,
  update_post,
  update_post_image,
  like_post,
  unlike_post,
  share_post,
  remove_share_post,
  countMyPosts,
  getMyPostsShared,
  getListUsersLikePost,
  searchPosts,
  searchAll,
};
