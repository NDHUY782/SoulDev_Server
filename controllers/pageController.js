const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const PostsModel = require("../models/PostsSchema");
const PageModel = require("../models/PageSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const UserModel = require("../models/UserSchema");
const CommentModel = require("../models/CommentSchema");
const novu = require("../config/novu");
dotenv.config();

const getListPages = async (req, res) => {
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
    //Loại trừ những page đã like và follow
    query.$and = [
      { "likes.user_id": { $ne: user_id } },
      { "followers.user_id": { $ne: user_id } },
      { creator_id: { $ne: user_id } },
    ];
    const data = await PageModel.find(query)
      .populate("likes.user_id")
      .populate("followers.user_id")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const itemCount = await PageModel.find(query).countDocuments().exec();
    const totalPage = Math.ceil(itemCount / pageSize);

    // Lấy số lượng bài post
    const pagesCount = data.length;

    const randomIndexes = [];
    while (randomIndexes.length < pagesCount) {
      const randomIndex = Math.floor(Math.random() * pagesCount);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }

    const randomPage = randomIndexes.map((index) => data[index]);

    res.status(200).send({
      itemCount,
      totalPage,
      page,
      pageSize,
      items: randomPage,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getPageById = async (req, res) => {
  const page_id = req.params.page_id;
  try {
    const pageData = await PageModel.findById(page_id)
      .populate("likes.user_id")
      .populate("followers.user_id");

    res.status(200).send({ success: true, data: pageData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const getPostsByPage = async (req, res) => {
  const page_id = req.params.page_id;
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
    const data = await PostsModel.find({
      query,
      page_id: page_id,
    })
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

    // Count comments by post_id
    const commentsCountByPostId = postIds.reduce((acc, postId) => {
      const postComments = comments.filter(
        (comment) => comment.post_id.toString() === postId,
      );
      acc[postId] = {
        count: postComments.length,
      };
      return acc;
    }, {});

    // Attach comment count to each post
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
    res.status(400).send({ success: false, msg: error.message });
  }
};

const getMyPages = async (req, res) => {
  const user_id = req.user._id;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const myPages = await PageModel.find({
      creator_id: user_id,
    }).populate("creator_id");

    // res.json({ myPages });
    res.status(200).send({ success: true, data: myPages });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const get_liked_pages = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const pages = await PageModel.find({
      "likes.user_id": user_id,
    });
    res.status(200).send({ success: true, data: pages });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const get_followed_pages = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const pages = await PageModel.find({
      "followers.user_id": user_id,
    })
      .populate("followers.user_id")
      .populate("likes.user_id");

    res.status(200).send({ success: true, data: pages });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const createPage = async (req, res) => {
  try {
    const { name, email, website, address, phone, description } = req.body;
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).json({ error: "User id does not exist" });
    }
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

    const newPage = new PageModel({
      name: name,
      email: email,
      website: website,
      address: address,
      phone: phone,
      description,
      image_page: imageUrls,
      creator_id: user_id,
    });

    newPage.managers.push({ user_id: user_id });

    const pageData = await newPage.save();
    res.status(201).send({ success: true, data: pageData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const updatePage = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).json({ error: "User id does not exist" });
    }
    const page_id = req.params.page_id;
    const pageData = await PageModel.findById(page_id);
    if (pageData) {
      const ownData = await PageModel.findOne({ creator_id: user_id });
      if (ownData) {
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
        const { name, email, website, address, phone, description } = req.body;
        const newData = await PageModel.findByIdAndUpdate(
          { _id: page_id },
          {
            $set: {
              name: name,
              email: email,
              website: website,
              address: address,
              phone: phone,
              description,
              image_page: imageUrls.length > 0 ? imageUrls : [...pageData.image_page],
            },
          },
          { new: true },
        );
        return res.status(200).send({ success: true, data: newData });
      } else {
        res.status(400).json({ error: "User can not edit this group" });
      }
    } else {
      res.status(400).json({ error: "Group does not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const deletePage = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (user) {
      const page_id = req.params.page_id;
      const data = await PageModel.findOneAndDelete({
        _id: page_id,
        creator_id: user_id,
      });
      if (data) {
        res.status(200).json({ msg: "Delete Successfully" });
      } else {
        res.status(400).json({ error: "User cant delete this group" });
      }
    } else {
      res.status(400).json({ error: "User id does not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
//--------------------------------------------------------
//-------------Manager Of Page----------------------------
const add_manager = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const page_id = req.params.page_id;
    const pageData = await PageModel.findOne({
      _id: page_id,
      creator_id: user_id,
    });

    if (pageData) {
      const manager_id = req.body.manager_id;
      const role = req.body.role;

      const areManager = pageData.managers.some(
        (manager) => manager.user_id.toString() === manager_id,
      );
      if (areManager) {
        return res.status(400).send({
          success: false,
          msg: "This user has already been a manager",
        });
      }
      pageData.managers.push({
        user_id: manager_id,
        role: role,
      });
      await pageData.save();
      res.status(200).send({ success: true, data: pageData });
    } else {
      res.status(400).send({ success: false, msg: "Page not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const remove_manager = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const page_id = req.params.page_id;
    const pageData = await PageModel.findOne({
      _id: page_id,
      creator_id: user_id,
    });
    if (pageData) {
      const manager_id = req.body.manager_id;
      const areManager = pageData.managers.some(
        (manager) => manager.user_id.toString() !== manager_id,
      );
      if (areManager) {
        res
          .status(400)
          .send({ success: false, msg: "This user is not a manager" });
      } else {
        if (!pageData.managers) pageData.managers = [];
        pageData.managers = pageData.managers.filter(
          (manager) => manager.user_id !== manager_id,
        );
        await pageData.save();
        res.status(200).send({ success: true, data: pageData });
      }
    } else {
      res.status(400).send({ success: false, msg: "Group not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//---------------------------------------------------
//---------------For Post In Page---------------------
const up_post_inPage = async (req, res) => {
  const user_id = req.user._id;
  const page_id = req.body.page_id;
  try {
    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const pageData = await PageModel.findById(page_id);
    if (!pageData) {
      return res.status(400).send({ success: false, msg: "Page not exist" });
    }
    const areManager = pageData.managers.some(
      (manager) => manager.user_id.toString() === user_id,
    );
    if (!areManager) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont have permission" });
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
      page_id: page_id,
      tittle: req.body.tittle,
      name: req.body.name,
      user_id: user_id,
      content: req.body.content,
      images: imageUrls,
    });

    const data = await postData.save();

    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
//----------Update post
const update_post_inPage = async (req, res) => {
  const page_id = req.body.page_id;
  const user_id = req.user._id;
  try {
    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const ownData = await PageModel.findOne({ creator_id: user_id });
    if (!ownData) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont have permission" });
    }

    const areManager = pageData.managers.some(
      (manager) => manager.user_id.toString() === user_id,
    );
    if (!areManager) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont have permission" });
    }

    const { tittle, name, content } = req.body;
    const updateData = {
      tittle,
      name,
      content,
    };
    const postsID = req.params.posts_id;

    const updatePostsData = await PostsModel.findOne({
      user_id: user_id,
      _id: postsID,
      page_id: page_id,
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
const update_post_image_inPage = async (req, res) => {
  const page_id = req.body.page_id;
  const user_id = req.user._id;
  const postId = req.params.post_id;
  try {
    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const ownData = await PageModel.findOne({
      _id: page_id,
      creator_id: user_id,
    });
    if (!ownData) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont have permission" });
    }

    const areManager = ownData.managers.some(
      (manager) => manager.user_id.toString() === user_id,
    );
    if (!areManager) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont have permission" });
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

    const updatePostsImage = await PostsModel.findOne({
      user_id: user_id,
      _id: postId,
      page_id: page_id,
    });

    if (updatePostsImage) {
      const data = await PostsModel.findByIdAndUpdate(
        { _id: postId },
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
const delete_post = async (req, res) => {
  const user_id = req.user._id;
  const post_id = req.params.post_id;
  const page_id = req.body.page_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const page = PageModel.findById(page_id);
    if (!page) {
      return res.status(400).send({ success: false, msg: "Group not exist" });
    }
    const areManger = page.managers.some(
      (id) => id.user_id.toString() === user_id,
    );
    if (!areManger) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont have permission" });
    }
    const post = await PostsModel.findOneAndDelete({
      _id: post_id,
    });
    if (!post) {
      return res.status(400).send({ success: false, msg: "Post not exist" });
    }
    await post.save();
    res.status(400).send({ success: true, data: post });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const get_random_post = async (req, res) => {
  try {
    // const allPosts = await PostsModel.find();
    const page_id = req.body.page_id;
    const allPosts = await PostsModel.find({
      page_id: page_id,
    });
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

const likePage = async (req, res) => {
  const user_id = req.user._id;
  const page_id = req.params.page_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "User not exist" });
    }
    const pageData = await PageModel.findById(page_id);
    if (!pageData) {
      return res.status(200).send({ success: false, msg: "Page not exist" });
    }

    const areLiked = pageData.likes.some(
      (like) => like.user_id.toString() === user_id,
    );
    if (areLiked) {
      return res
        .status(400)
        .send({ success: false, msg: "User have already like this page" });
    }
    const areFollowed = pageData.followers.some(
      (follow) => follow.user_id.toString() === user_id,
    );
    if (areFollowed) {
      return res
        .status(400)
        .send({ success: false, msg: "User  have already follow this page" });
    }

    if (!pageData.likes) pageData.likes = [];
    pageData.likes.push({ user_id: user_id });

    if (!pageData.followers) pageData.followers = [];
    pageData.followers.push({ user_id: user_id });

    await pageData.save();
    res.status(200).send({ success: true, data: pageData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const unLikePage = async (req, res) => {
  const user_id = req.user._id;
  const page_id = req.params.page_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "User not exist" });
    }
    const pageData = await PageModel.findById(page_id);
    if (!pageData) {
      return res.status(200).send({ success: false, msg: "Page not exist" });
    }

    const areLiked = pageData.likes.some(
      (like) => like.user_id.toString() === user_id,
    );
    if (!areLiked) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont like this page" });
    }
    const areFollowed = pageData.followers.some(
      (follow) => follow.user_id.toString() === user_id,
    );
    if (!areFollowed) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont follow this page" });
    }

    if (!pageData.likes) pageData.likes = [];
    pageData.likes = pageData.likes.filter(
      (like) => like.user_id.toString() !== user_id,
    );

    if (!pageData.followers) pageData.followers = [];
    pageData.followers = pageData.followers.filter(
      (follower) => follower.user_id.toString() !== user_id,
    );

    await pageData.save();
    res.status(200).send({ success: true, data: pageData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const followPage = async (req, res) => {
  const user_id = req.user._id;
  const page_id = req.params.page_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "User not exist" });
    }
    const pageData = await PageModel.findById(page_id);
    if (!pageData) {
      return res.status(200).send({ success: false, msg: "Page not exist" });
    }

    const areFollowed = pageData.followers.some(
      (follow) => follow.user_id.toString() === user_id,
    );
    if (areFollowed) {
      return res
        .status(400)
        .send({ success: false, msg: "User have already follow this page" });
    }

    if (!pageData.followers) pageData.followers = [];
    pageData.followers.push({ user_id: user_id });

    await pageData.save();
    res.status(200).send({ success: true, data: pageData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const unFollowPage = async (req, res) => {
  const user_id = req.user._id;
  const page_id = req.params.page_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "User not exist" });
    }
    const pageData = await PageModel.findById(page_id);
    if (!pageData) {
      return res.status(200).send({ success: false, msg: "Page not exist" });
    }

    const areFollowed = pageData.followers.some(
      (follow) => follow.user_id.toString() === user_id,
    );
    if (!areFollowed) {
      return res
        .status(400)
        .send({ success: false, msg: "User dont follow this page" });
    }

    if (!pageData.followers) pageData.followers = [];
    pageData.followers = pageData.followers.filter(
      (follower) => follower.user_id.toString() !== user_id,
    );

    await pageData.save();
    res.status(200).send({ success: true, data: pageData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
//Search Page
const searchPages = async (req, res) => {
  const user_id = req.user._id;
  const search = req.body.search;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "Profile not exist" });
    }
    const data = await PageModel.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    });
    if (data.length > 0) {
      res.status(200).send({ success: true, data: data });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
module.exports = {
  getListPages,
  getPageById,
  getPostsByPage,
  getMyPages,
  get_liked_pages,
  get_followed_pages,
  get_random_post,
  createPage,
  updatePage,
  deletePage,
  up_post_inPage,
  update_post_inPage,
  update_post_image_inPage,
  delete_post,
  countMyPosts,
  likePage,
  unLikePage,
  followPage,
  unFollowPage,
  add_manager,
  remove_manager,
  searchPages,
};
