const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const novu = require("../config/novu");
const PostsModel = require("../models/PostsSchema");
const CommentModel = require("../models/CommentSchema");
const UserModel = require("../models/UserSchema");
const GroupMediaModel = require("../models/GroupMediaSchema");
const PageModel = require("../models/PageSchema");
const ProfileModel = require("../models/ProfileSchema");
dotenv.config();

// const getListPosts = async (req, res) => {
//   const user_id = req.user._id;
//   const page = parseInt(req.query.page) || 1;
//   const keyword = req.query.keyword || "";

//   const pageSize = Number(process.env.PAGE_SIZE || 10);

//   let query = {};
//   if (keyword) {
//     query = {
//       $or: [{ text: keyword }],
//     };
//   }

//   try {
//     // Lấy các nhóm mà người dùng là thành viên
//     const userGroups = await GroupMediaModel.find({
//       "members.user_id": user_id,
//     })
//       .select("_id")
//       .exec();
//     const groupIds = userGroups.map((group) => group._id);

//     // Lấy các page mà người dùng có theo dõi
//     const userPages = await PageModel.find({
//       "followers.user_id": user_id,
//     })
//       .select("_id")
//       .exec();
//     const pageIds = userPages.map((page) => page._id);

//     const userFollowing = await ProfileModel.findOne({ user_id })
//       .select("followings")
//       .exec();
//     const followingIds = userFollowing.followings.map((item) => item.user_id);

//     const userSavePost = await ProfileModel.findOne({ user_id })
//       .select("save_posts")
//       .exec();
//     const savePostIds = userSavePost.save_posts.map((item) =>
//       item.post_id.toString(),
//     );

//     query = {
//       ...query,
//       $or: [
//         { group_id: { $in: groupIds } },
//         { page_id: { $in: pageIds } },
//         { user_id: { $in: followingIds } },
//         { user_id },
//       ],
//     };

//     const data = await PostsModel.find(query)
//       .populate("page_id")
//       .populate("likes.user_id")
//       .populate("group_id")
//       .populate("user_id")
//       .sort({ created: -1 })
//       .skip((page - 1) * pageSize)
//       .limit(pageSize)
//       .exec();

//     const postIds = data.map((post) => post._id.toString());

//     //Cho save post
//     const savePostIdSet = new Set(savePostIds);
//     //Cho Comments
//     const comments = await CommentModel.find({
//       post_id: { $in: postIds },
//     }).exec();

//     // Đếm số bình luận theo post_id
//     const commentsCountByPostId = postIds.reduce((acc, postId) => {
//       const postComments = comments.filter(
//         (comment) => comment.post_id.toString() === postId,
//       );
//       acc[postId] = {
//         count: postComments.length,
//       };
//       return acc;
//     }, {});
//     // Đính kèm số bình luận và kiểm tra được save chưa vào mỗi bài viết
//     const postsWithCommentCount = data.map((post) => ({
//       ...post.toObject(),
//       commentsCount: commentsCountByPostId[post._id.toString()]?.count || 0,
//       isSaved: savePostIdSet.has(post._id.toString()),
//     }));

//     const rowCount = await PostsModel.find(query).countDocuments().exec();
//     const totalPage = Math.ceil(rowCount / pageSize);

//     res.status(200).json({
//       totalPage,
//       page,
//       pageSize,
//       items: postsWithCommentCount,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({ success: false });
//   }
// };
const getListPosts = async (req, res) => {
  const user_id = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";

  const pageSize = Number(process.env.PAGE_SIZE || 10);

  let query = {};
  if (keyword) {
    query = {
      $or: [{ text: { $regex: keyword, $options: "i" } }],
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

    const userFollowing = await ProfileModel.findOne({ user_id })
      .select("followings")
      .exec();
    const followingIds = userFollowing
      ? userFollowing.followings.map((item) => item.user_id)
      : [];

    const userSavePost = await ProfileModel.findOne({ user_id })
      .select("save_posts")
      .exec();
    const savePostIds = userSavePost
      ? userSavePost.save_posts.map((item) => item.post_id.toString())
      : [];

    // Kiểm tra xem người dùng có bất kỳ bạn bè, nhóm hoặc trang nào không
    const hasFriendsOrGroupsOrPages =
      followingIds.length > 0 || groupIds.length > 0 || pageIds.length > 0;

    let priorityPosts = [];
    let strangerPosts = [];

    if (hasFriendsOrGroupsOrPages) {
      // Truy vấn ưu tiên: bài viết từ bạn bè, nhóm và trang
      const friendsQuery = {
        ...query,
        user_id: { $in: followingIds },
      };

      const groupsQuery = {
        ...query,
        group_id: { $in: groupIds },
      };

      const pagesQuery = {
        ...query,
        page_id: { $in: pageIds },
      };

      const userPostsQuery = {
        ...query,
        user_id,
      };

      // Lấy bài viết từ bạn bè trước
      const friendsPosts = await PostsModel.find(friendsQuery)
        .populate("page_id")
        .populate("likes.user_id")
        .populate("group_id")
        .populate("user_id")
        .sort({ created: -1 })
        .exec();

      // Tiếp theo là bài viết từ nhóm
      const groupsPosts = await PostsModel.find(groupsQuery)
        .populate("page_id")
        .populate("likes.user_id")
        .populate("group_id")
        .populate("user_id")
        .sort({ created: -1 })
        .exec();

      // Sau đó là bài viết từ các trang
      const pagesPosts = await PostsModel.find(pagesQuery)
        .populate("page_id")
        .populate("likes.user_id")
        .populate("group_id")
        .populate("user_id")
        .sort({ created: -1 })
        .exec();

      // Cuối cùng là bài viết của chính người dùng
      const userPosts = await PostsModel.find(userPostsQuery)
        .populate("page_id")
        .populate("likes.user_id")
        .populate("group_id")
        .populate("user_id")
        .sort({ created: -1 })
        .exec();

      // Kết hợp các bài viết ưu tiên theo thứ tự
      priorityPosts = [
        ...friendsPosts,
        ...groupsPosts,
        ...pagesPosts,
        ...userPosts,
      ];
    }

    // Lấy bài viết của người lạ (nếu người dùng chưa có bạn bè hoặc nhóm, hoặc để bổ sung vào cuối)
    const strangerQuery = {
      ...query,
      $nor: [
        { user_id: { $in: followingIds } },
        { group_id: { $in: groupIds } },
        { page_id: { $in: pageIds } },
        { user_id },
      ],
    };

    strangerPosts = await PostsModel.find(strangerQuery)
      .populate("page_id")
      .populate("likes.user_id")
      .populate("group_id")
      .populate("user_id")
      .sort({ created: -1 })
      .exec();

    // Kết hợp bài viết ưu tiên và bài viết của người lạ
    const combinedPosts = hasFriendsOrGroupsOrPages
      ? [...priorityPosts, ...strangerPosts]
      : strangerPosts;

    // Phân trang sau khi kết hợp
    const paginatedPosts = combinedPosts.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    const postIds = paginatedPosts.map((post) => post._id.toString());

    // Lấy bình luận và đếm số bình luận
    const comments = await CommentModel.find({
      post_id: { $in: postIds },
    }).exec();

    const commentsCountByPostId = postIds.reduce((acc, postId) => {
      const postComments = comments.filter(
        (comment) => comment.post_id.toString() === postId,
      );
      acc[postId] = {
        count: postComments.length,
      };
      return acc;
    }, {});

    const savePostIdSet = new Set(savePostIds);

    // Đính kèm số bình luận và trạng thái đã lưu vào bài viết
    const postsWithCommentCount = paginatedPosts.map((post) => ({
      ...post.toObject(),
      commentsCount: commentsCountByPostId[post._id.toString()]?.count || 0,
      isSaved: savePostIdSet.has(post._id.toString()),
    }));

    // Tổng số bài viết
    const rowCount = combinedPosts.length;
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
    const user_id = req.user._id;

    const getComments = await CommentModel.find({ post_id: post_id }).populate(
      "user_id",
      "first_name last_name image",
    );

    const userSavePost = await ProfileModel.findOne({ user_id })
      .select("save_posts")
      .exec();

    const savePostIds = userSavePost.save_posts.map((item) =>
      item.post_id.toString(),
    );
    //Cho save post
    const savePostIdSet = new Set(savePostIds);

    const dataByPostsId = await PostsModel.findById(post_id)
      .populate("page_id")
      .populate("group_id")
      .populate("likes.user_id")
      .populate("user_id")
      .exec();

    const data = {
      ...dataByPostsId.toObject(),
      isSaved: savePostIdSet.has(dataByPostsId._id.toString()),
    };

    return res.status(200).send({
      success: true,
      post_data: data,
      comment_data: getComments,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getListPostsByCurrentUserId = async (req, res) => {
  try {
    const user_id = req.user._id;

    const userSavePost = await ProfileModel.findOne({ user_id })
      .select("save_posts")
      .exec();

    const savePostIds = userSavePost.save_posts.map((item) =>
      item.post_id.toString(),
    );
    //Cho save post
    const savePostIdSet = new Set(savePostIds);

    const dataByUserId = await PostsModel.find({ user_id })
      .populate("page_id")
      .populate("group_id")
      .populate("user_id")
      .populate("likes.user_id")
      .sort({ created: -1 });

    const savePosts = dataByUserId.map((post) => ({
      ...post.toObject(),
      isSaved: savePostIdSet.has(post._id.toString()),
    }));

    res.status(200).send({ success: true, data: savePosts });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const getListPostsByUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const userSavePost = await ProfileModel.findOne({ user_id })
      .select("save_posts")
      .exec();
    const savePostIds = userSavePost.save_posts.map((item) =>
      item.post_id.toString(),
    );

    const posts = await PostsModel.find({ user_id })
      .populate("page_id")
      .populate("group_id")
      .populate("user_id")
      .populate("likes.user_id")
      .sort({ created: -1 });

    const postIds = posts.map((post) => post._id.toString());

    //Cho save post
    const savePostIdSet = new Set(savePostIds);

    //Cho Comments
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
    const postsWithCommentCount = posts.map((post) => ({
      ...post.toObject(),
      commentsCount: commentsCountByPostId[post._id.toString()]?.count || 0,
      isSaved: savePostIdSet.has(post._id.toString()),
    }));

    res.status(200).send({ success: true, data: postsWithCommentCount });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};

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
    const userSavePost = await ProfileModel.findOne({ user_id })
      .select("save_posts")
      .exec();
    const savePostIds = userSavePost.save_posts.map((item) =>
      item.post_id.toString(),
    );

    const postsData = await PostsModel.find({ "shares.user_id": user_id })
      .populate("user_id")
      .populate("likes.user_id")
      .sort({ "shares.createdAt": -1 });

    //Cho save post
    const savePostIdSet = new Set(savePostIds);

    const data = postsData.map((post) => ({
      ...post.toObject(),
      isSaved: savePostIdSet.has(post._id.toString()),
    }));
    res.status(200).send({ success: true, data: data });
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

//Lưu bài viết và lấy ra bài viết theo user
const savePost = async (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.user._id;
  try {
    const profileData = await ProfileModel.findOne({ user_id });
    if (!profileData) {
      return res.status(400).send({ success: false, msg: "No user in system" });
    }
    const savePost = await PostsModel.findById(post_id);
    if (!savePost) {
      return res
        .status(400)
        .send({ success: false, msg: "No post is saved in system" });
    }
    const alreadySaved = profileData.save_posts.some(
      (savedPost) => savedPost.post_id.toString() === post_id,
    );
    if (alreadySaved) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already saved this post" });
    }

    profileData.save_posts.push({ post_id: post_id, isSaved: true });
    savePost.isSavedBy.push({ user_id: user_id });

    await profileData.save();
    await savePost.save();

    res
      .status(200)
      .send({ success: true, profile: profileData, post: savePost });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const unSavePost = async (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.user._id;
  try {
    const profileData = await ProfileModel.findOne({ user_id });
    if (!profileData) {
      return res.status(400).send({ success: false, msg: "No user in system" });
    }
    const savePost = await PostsModel.findById(post_id);
    if (!savePost) {
      return res
        .status(400)
        .send({ success: false, msg: "No post is saved in system" });
    }
    const alreadySaved = profileData.save_posts.some(
      (savedPost) => savedPost.post_id.toString() === post_id,
    );
    if (!alreadySaved) {
      return res
        .status(400)
        .send({ success: false, msg: "Had not saved this post yet " });
    }
    if (!profileData.save_posts) profileData.save_posts = [];
    profileData.save_posts = profileData.save_posts.filter(
      (item) => item.post_id.toString() !== post_id,
    );
    if (!savePost.isSavedBy) savePost.isSavedBy = [];
    savePost.isSavedBy = savePost.isSavedBy.filter(
      (item) => item.user_id.toString() !== user_id,
    );

    await profileData.save();
    await savePost.save();
    res
      .status(200)
      .send({ success: true, profile: profileData, post: savePost });
  } catch (error) {
    res.status(400).send({ success: false });
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
  savePost,
  unSavePost,
};
