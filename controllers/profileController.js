const ProfileModel = require("../models/ProfileSchema");
const UserModel = require("../models/UserSchema");
const PostsModel = require("../models/PostsSchema");
const ConversationModel = require("../models/ConversationSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const { createToken } = require("../config/auth");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const client = require("../config/connect_redis");
dotenv.config();
const novu = require("../config/novu");
//List recommend friends
const listRecommendFriends = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userProfile = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("friends.user_id");
    if (!userProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }
    const friendIds = userProfile.friends.map((friend) => friend.user_id);

    const suggestedFriends = await ProfileModel.find({
      // $nin loại bỏ những id trong mảng
      user_id: { $nin: friendIds.concat(user_id) },
    })
      .select("user_id")
      .populate("user_id");

    res.status(200).send({ success: true, recommendFriend: suggestedFriends });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//List paging recommend friends
const listRecommendFriendsPaging = async (req, res) => {
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
    const user_id = req.user._id;
    const userProfile = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("friends.user_id");
    if (!userProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }
    const friend_requestIds = userProfile.friend_requests.map(
      (friend) => friend.user_id,
    );
    const friendIds = userProfile.friends.map((friend) => friend.user_id);

    //tạo biến chứa 2 mảng id
    const excludeIds = friendIds.concat(friend_requestIds).concat(user_id);
    //lấy danh sách người k là bạn bè
    const suggestedFriends = await ProfileModel.find({
      // $nin loại bỏ những id trong mảng
      user_id: { $nin: excludeIds },
    })
      .select("user_id")
      .populate("user_id")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    // Random người dùng kh là bạn bè
    const profileCount = suggestedFriends.length;

    const randomIndexes = [];
    while (randomIndexes.length < profileCount) {
      const randomIndex = Math.floor(Math.random() * profileCount);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }

    const randomProfiles = randomIndexes.map(
      (index) => suggestedFriends[index],
    );

    //Phân trang + giới hạn
    const rowCount = await ProfileModel.find(query).countDocuments().exec();
    const totalPage = Math.ceil(rowCount / pageSize);

    res.status(200).send({
      totalPage,
      page: page,
      pageSize: pageSize,
      items: randomProfiles,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//List all friends
const listAllFriends = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profileData = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("friends.user_id");
    if (!profileData) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }
    const data = profileData.friends;

    res.status(200).send({ success: true, listFriend: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
//List following
const listFollowingUser = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profileData = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("followings.user_id");
    if (!profileData) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }
    const data = profileData.followings;

    res.status(200).send({ success: true, listFollowingUser: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//List follower
const listFollowerUser = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profileData = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("followers.user_id");
    if (!profileData) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }
    const data = profileData.followers;

    res.status(200).send({ success: true, listFollowerUser: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//List friends request
const listFriendRequest = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profileData = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("friend_requests.user_id");
    if (!profileData) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }
    const data = profileData.friend_requests;

    res.status(200).send({ success: true, listFriendRequest: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const create_profile = async (req, res) => {
  try {
    const user_id = req.user._id;
    const profile = new ProfileModel({
      user_id: user_id,
      company: req.body.company,
      website: req.body.website,
      skills: req.body.skills,
      status: req.body.status,
      bio: req.body.bio,
    });
    const userData = await ProfileModel.findOne({ user_id: user_id });
    if (userData) {
      res.status(400).send({ success: false, msg: "Không được thêm nữa" });
    } else {
      const newProfile = await profile.save();
      res.status(200).send({ success: true, data: newProfile });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const get_profile_by_user = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const data = await ProfileModel.findOne({ user_id }).populate("user_id");

    if (!data) {
      return res
        .status(400)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const get_profile_by_owner = async (req, res) => {
  const user_id = req.user._id;
  try {
    const data = await ProfileModel.findOne({ user_id }).populate("user_id");

    if (!data) {
      return res
        .status(400)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const add_address = async (req, res) => {
  try {
    const user_id = req.user._id;
    const data = await ProfileModel.findOne({ user_id: user_id });
    if (data) {
      if (data.address.some((item) => item.user_id === user_id)) {
        return res.status(400).send({
          success: false,
          msg: "Can not add address anymore",
        });
      }
      const { city, district, ward, location } = req.body;
      data.address.unshift({
        user_id: user_id,
        city: city,
        district: district,
        ward: ward,
        location: location,
      });
      await data.save();
      res.status(200).send({ success: true, data: data });
    } else {
      res.status(200).send({ success: false, msg: "This profile not exist" });
    }
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const update_address = async (req, res) => {
  try {
    const user_id = req.user._id;
    const data = await ProfileModel.findOne({ user_id: user_id });
    if (data) {
      if (data.address.some((item) => item.user_id === user_id)) {
        const { city, district, ward, location } = req.body;
        data.address.fill({
          user_id: user_id,
          city: city,
          district: district,
          ward: ward,
          location: location,
        });
        await data.save();
        res.status(200).send({ success: true, data: data });
      } else {
        res
          .status(200)
          .send({ success: false, msg: "This user have not added address" });
      }
    } else {
      res.status(200).send({ success: false, msg: "This profile not exist" });
    }
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};

const update_profile = async (req, res) => {
  // const { company, website, skills, status, bio } = req.body;
  // const updateData = {
  //   company,
  //   website,
  //   skills,
  //   status,
  //   bio,
  // };
  const user_id = req.user._id;
  const data = await ProfileModel.findOneAndUpdate(
    { user_id: user_id },
    {
      // $set: updateData,
      $set: req.body,
    },
    { new: true },
  );
  return res.status(200).send({ success: true, data: data });
};

const add_experience = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { title, company, location, current, from, to, description } =
      req.body;
    const experienceData = {
      title,
      company,
      location,
      current,
      from: new Date(from),
      to: to ? new Date(to) : null,
      description,
    };

    const profileData = await ProfileModel.findOne({ user_id: user_id });

    if (profileData) {
      profileData.experience.unshift(experienceData);
      await profileData.save();
      res.status(200).send({ success: true, data: profileData });
    } else {
      res.status(404).send({ success: false, msg: "Profile not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const update_experience = async (req, res) => {
  const user_id = req.user._id;
  const experience_id = req.params.experience_id;

  try {
    const { title, company, location, current, from, to, description } =
      req.body;

    const profileData = await ProfileModel.findOne({ user_id: user_id });
    if (profileData) {
      const experienceToUpdate = profileData.experience.find(
        (experience) => experience._id == experience_id,
      );
      if (experienceToUpdate) {
        experienceToUpdate.title = title;
        experienceToUpdate.company = company;
        experienceToUpdate.location = location;
        experienceToUpdate.current = current;
        experienceToUpdate.from = from
          ? new Date(from)
          : experienceToUpdate.from;
        experienceToUpdate.to = to ? new Date(to) : experienceToUpdate.to;
        experienceToUpdate.description = description;
        await profileData.save();
        res.status(200).send({ success: true, data: experienceToUpdate });
      } else {
        res.status(404).send({ success: false, msg: "Experience not found" });
      }
    } else {
      res.status(404).send({ success: false, msg: "Profile not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};

const add_education = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { school, degree, location, from, to, current, description } =
      req.body;
    const educationData = {
      school,
      degree,
      location,
      current,
      from: new Date(from),
      to: to ? new Date(to) : null,
      description,
    };

    const profileData = await ProfileModel.findOne({ user_id: user_id });

    if (profileData) {
      profileData.education.unshift(educationData);
      await profileData.save();
      res.status(200).send({ success: true, data: profileData });
    } else {
      res.status(404).send({ success: false, msg: "Profile not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const update_education = async (req, res) => {
  const user_id = req.user._id;
  const edu_id = req.params.edu_id;

  try {
    const { school, degree, location, from, to, description } = req.body;

    const profileData = await ProfileModel.findOne({ user_id: user_id });
    if (profileData) {
      const educationToUpdate = profileData.education.find(
        (education) => education._id == edu_id,
      );
      if (educationToUpdate) {
        educationToUpdate.school = school;
        educationToUpdate.degree = degree;
        educationToUpdate.location = location;
        educationToUpdate.from = from ? new Date(from) : educationToUpdate.from;
        educationToUpdate.to = to ? new Date(to) : educationToUpdate.to;
        educationToUpdate.description = description;
        await profileData.save();
        res.status(200).send({ success: true, data: educationToUpdate });
      } else {
        res.status(404).send({ success: false, msg: "Education not found" });
      }
    } else {
      res.status(404).send({ success: false, msg: "Profile not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const follow = async (req, res) => {
  try {
    const fromUser_id = req.user._id;
    const toUser_id = req.body.toUser_id;

    const fromProfile = await ProfileModel.findOne({ user_id: fromUser_id });
    if (!fromProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    const toProfile = await ProfileModel.findOne({ user_id: toUser_id });
    if (!toProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for target user" });
    }

    if (
      fromProfile.followings &&
      fromProfile.followings.some(
        (follower) => follower.user_id.toString() === fromUser_id,
      )
    ) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already followed this user" });
    }
    if (
      toProfile.followers &&
      toProfile.followers.some(
        (follower) => follower.user_id.toString() === toUser_id,
      )
    ) {
      return res.status(400).send({
        success: false,
        msg: "This user has already been followed by from user",
      });
    }

    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings.unshift({ user_id: toUser_id });

    if (!toProfile.followers) toProfile.followers = [];
    toProfile.followers.unshift({ user_id: fromUser_id });

    await fromProfile.save();
    await toProfile.save();
    const userProfile = await UserModel.findOne({
      _id: fromUser_id,
    });
    if (!userProfile) {
      return res.status(500).send({
        success: false,
        msg: "Không tìm thấy hồ sơ của user",
      });
    }

    await novu.trigger("follow-user-notification", {
      to: {
        subscriberId: toProfile.user_id.toString(),
      },
      // payload: 'Có người đã like bài viết của bạn!'
      payload: {
        image: userProfile.image,
        title: `${userProfile.first_name} ${userProfile.last_name} đã theo dõi bạn`,
        url: `people/${fromUser_id}`,
        type: "success",
      },
    });
    res.status(200).send({ success: true, data: fromProfile });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const unfollow = async (req, res) => {
  try {
    const fromUser_id = req.user._id;
    const toUser_id = req.body.toUser_id;

    const fromProfile = await ProfileModel.findOne({ user_id: fromUser_id });
    if (!fromProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    const toProfile = await ProfileModel.findOne({ user_id: toUser_id });
    if (!toProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for target user" });
    }

    if (
      fromProfile.followings &&
      fromProfile.followings.some(
        (follower) => follower.user_id.toString() === fromUser_id,
      )
    ) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already followed this user" });
    }
    if (
      toProfile.followers &&
      toProfile.followers.some(
        (follower) => follower.user_id.toString() === toUser_id,
      )
    ) {
      return res.status(400).send({
        success: false,
        msg: "This user has already been followed by from user",
      });
    }

    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings = fromProfile.followings.filter(
      (follower) => follower.user_id.toString() !== toUser_id,
    );
    if (!toProfile.followers) toProfile.followers = [];
    toProfile.followers = toProfile.followers.filter(
      (follower) => follower.user_id.toString() !== fromUser_id,
    );

    await fromProfile.save();
    await toProfile.save();

    res.status(200).send({ success: true, data: fromProfile });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};

const add_friend = async (req, res) => {
  const fromUser_id = req.user._id;
  const toUser_id = req.body.toUser_id;
  try {
    const fromProfile = await ProfileModel.findOne({ user_id: fromUser_id });
    if (!fromProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    const toProfile = await ProfileModel.findOne({ user_id: toUser_id });
    if (!toProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for target user" });
    }
    //kiểm tra là đã là bạn
    if (
      toProfile.friends &&
      fromProfile.friends.some(
        (friend) => friend.user_id.toString() === fromUser_id,
      )
    ) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already been be friend" });
    }

    // if (
    //   fromProfile.friend_requests &&
    //   fromProfile.friend_requests.some(
    //     (friend_request) => friend_request.user_id.toString() === toUser_id,
    //   )
    // ) {
    //   return res.status(400).send({
    //     success: false,
    //     msg: "Have been already send a friend request to this user",
    //   });
    // }

    //kiểm tra đã có lời mời kết bạn hay chưa
    if (
      toProfile.friend_requests &&
      toProfile.friend_requests.some(
        (friend_request) => friend_request.user_id.toString() === fromUser_id,
      )
    ) {
      return res.status(400).send({
        success: false,
        msg: "Have been already send a friend request to this user",
      });
    }

    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings.unshift({ user_id: toUser_id });

    if (!toProfile.followers) toProfile.followers = [];
    toProfile.followers.unshift({ user_id: fromUser_id });

    if (!toProfile.friend_requests) toProfile.friend_requests = [];
    toProfile.friend_requests.unshift({ user_id: fromUser_id });

    await fromProfile.save();
    await toProfile.save();

    const userProfile = await UserModel.findOne({
      _id: fromUser_id,
    });
    if (!userProfile) {
      return res.status(500).send({
        success: false,
        msg: "Không tìm thấy hồ sơ của user",
      });
    }
    await novu.trigger("add-friend-notification", {
      to: {
        subscriberId: toProfile.user_id.toString(),
      },
      payload: {
        image: userProfile.image,
        title: `${userProfile.first_name} ${userProfile.last_name} đã gửi lời mời kết bạn`,
        // url: `people/${fromUser_id}`,
        url: `people/friends-request`,
        type: "success",
      },
    });

    res
      .status(200)
      .send({ success: true, toUser: toProfile, fromUser: fromProfile });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const accept_friend_request = async (req, res) => {
  try {
    const fromUser_id = req.user._id;
    const requestUser_id = req.body.requestUser_id;

    // const data = await ProfileModel.findOne({ user_id: fromUser_id });
    // console.log(data);
    const fromProfile = await ProfileModel.findOne({ user_id: fromUser_id });
    if (!fromProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    const requestProfile = await ProfileModel.findOne({
      user_id: requestUser_id,
    });
    if (!requestProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for target user" });
    }

    // //Kiểm tra xem có là bạn chưa từ người nhận
    // if (
    //   requestProfile.friends &&
    //   requestProfile.friends.some(
    //     (friend) => friend.user_id.toString() === fromUser_id,
    //   )
    // ) {
    //   return res
    //     .status(400)
    //     .send({ success: false, msg: "Have already been a friend" });
    // }

    // // //Kiểm tra xem có là bạn chưa từ người gửi
    // if (
    //   fromProfile.friends &&
    //   fromProfile.friends.some(
    //     (friend) => friend.user_id.toString() === requestUser_id,
    //     // console.log(friend.user_id),
    //   )
    // ) {
    //   return res
    //     .status(400)
    //     .send({ success: false, msg: "Have already been a friend" });
    // }

    // Kiểm tra xem người kia đã gửi lời mời kết bạn chưa
    if (
      !fromProfile.friend_requests ||
      !fromProfile.friend_requests.some(
        (friend) => friend.user_id.toString() === requestUser_id,
      )
    ) {
      return res.status(400).send({
        success: false,
        msg: "Không có lời mời kết bạn nào từ người dùng này",
      });
    }

    if (!fromProfile.friend_requests) fromProfile.friend_requests = [];
    fromProfile.friend_requests = fromProfile.friend_requests.filter(
      (friend) => friend.user_id.toString() !== requestUser_id,
    );

    if (!fromProfile.friends) fromProfile.friends = [];
    fromProfile.friends.unshift({ user_id: requestUser_id });

    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings.unshift({ user_id: requestUser_id });

    if (!requestProfile.followers) requestProfile.followers = [];
    requestProfile.followers.unshift({ user_id: fromUser_id });

    if (!requestProfile.friends) requestProfile.friends = [];
    requestProfile.friends.unshift({ user_id: fromUser_id });
    // { user_id_1: fromUser_id }, { user_id_2: fromUser_id }

    await fromProfile.save();
    await requestProfile.save();

    const userProfile = await UserModel.findOne({
      _id: fromUser_id,
    });
    if (!userProfile) {
      return res.status(500).send({
        success: false,
        msg: "Không tìm thấy hồ sơ của user",
      });
    }

    await novu.trigger("accept-friend-request-notification", {
      to: {
        subscriberId: requestProfile.user_id.toString(),
      },
      // payload: 'Có người đã like bài viết của bạn!'
      payload: {
        image: userProfile.image,
        title: `${userProfile.first_name} ${userProfile.last_name} đã chấp nhận lời mời kết bạn`,
        url: `people/${fromUser_id}`,
        type: "success",
      },
    });
    const existConversation = await ConversationModel.find({
      $or: [
        { $and: [{ user_id_1: fromUser_id }, { user_id_2: requestUser_id }] },
        { $and: [{ user_id_1: requestUser_id }, { user_id_2: fromUser_id }] },
      ],
    });
    if (existConversation.length !== 0) {
      return res.status(200).send({
        success: false,
        msg: "this conversation have been existed",
      });
    }
    const conversation = await ConversationModel.create({
      user_id_1: fromUser_id,
      user_id_2: requestUser_id,
    });
    res
      .status(200)
      .send({ success: true, data: fromProfile, chat: conversation });
    // res.status(200).send({ success: true, data: fromProfile });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const remove_friend_request = async (req, res) => {
  try {
    const fromUser_id = req.user._id;
    const requestUser_id = req.body.requestUser_id;

    const fromProfile = await ProfileModel.findOne({ user_id: fromUser_id });
    if (!fromProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    const requestProfile = await ProfileModel.findOne({
      user_id: requestUser_id,
    });
    if (!requestProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for target user" });
    }

    //Kiểm tra xem có là bạn chưa từ người nhận
    if (
      requestProfile.friends &&
      requestProfile.friends.some(
        (friend) => friend.user_id.toString() === fromUser_id,
      )
    ) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already been a friend" });
    }

    //Kiểm tra xem có là bạn chưa từ người gửi
    if (
      fromProfile.friends &&
      fromProfile.friends.some(
        (friend) => friend.user_id.toString() === requestUser_id,
      )
    ) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already been a friend" });
    }

    //Kiểm tra xem người kia đã gửi lời mời kết bạn chưa
    const areSendRequest = requestProfile.friend_requests.some(
      (friend) => friend.user_id.toString() === fromUser_id,
    );
    if (!areSendRequest) {
      return res.status(400).send({
        success: false,
        msg: "Have no any friends request for this user",
      });
    }

    if (!requestProfile.friend_requests) requestProfile.friend_requests = [];
    requestProfile.friend_requests = requestProfile.friend_requests.filter(
      (friend) => friend.user_id.toString() !== fromUser_id,
    );

    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings = fromProfile.followings.filter(
      (follower) => follower.user_id.toString() !== requestUser_id,
    );
    if (!requestProfile.followers) requestProfile.followers = [];
    requestProfile.followers = requestProfile.followers.filter(
      (follower) => follower.user_id.toString() !== fromUser_id,
    );

    await fromProfile.save();
    await requestProfile.save();

    res.status(200).send({
      success: true,
      fromUser: fromProfile,
      requestUser: requestProfile,
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};

const remove_friend = async (req, res) => {
  try {
    const fromUser_id = req.user._id;
    const toUser_id = req.body.toUser_id;

    const fromProfile = await ProfileModel.findOne({ user_id: fromUser_id });
    if (!fromProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for your user" });
    }

    const toProfile = await ProfileModel.findOne({ user_id: toUser_id });
    if (!toProfile) {
      return res
        .status(500)
        .send({ success: false, msg: "There is not profile for target user" });
    }
    const areFriends = fromProfile.friends.some(
      (friend) => friend.user_id.toString() === toUser_id,
    );

    if (!areFriends) {
      return res
        .status(400)
        .send({ success: false, msg: "Have not been be friend yet" });
    }

    if (!fromProfile.friends) fromProfile.friends = [];
    fromProfile.friends = fromProfile.friends.filter(
      (friend) => friend.user_id.toString() !== toUser_id,
    );
    if (!toProfile.friends) toProfile.friends = [];
    toProfile.friends = toProfile.friends.filter(
      (friend) => friend.user_id.toString() !== fromUser_id,
    );

    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings = fromProfile.followings.filter(
      (follower) => follower.user_id.toString() !== toUser_id,
    );
    if (!fromProfile.followers) fromProfile.followers = [];
    fromProfile.followers = fromProfile.followers.filter(
      (follower) => follower.user_id.toString() !== toUser_id,
    );

    if (!toProfile.followers) toProfile.followers = [];
    toProfile.followers = toProfile.followers.filter(
      (follower) => follower.user_id.toString() !== fromUser_id,
    );
    if (!toProfile.followings) toProfile.followings = [];
    toProfile.followings = toProfile.followings.filter(
      (follower) => follower.user_id.toString() !== fromUser_id,
    );

    await fromProfile.save();
    await toProfile.save();

    res.status(200).send({ success: true, data: fromProfile });

    //  await toProfile.save();

    //  res.status(200).send({success: true, data: toProfile })
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};
const MAX_INACTIVITY_TIME = 300;
// Kiểm tra trạng thái online của bạn bè
function isUserOnline(user_id) {
  return new Promise((resolve, reject) => {
    client.get(user_id, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result === "online");
      }
    });
  });
}
const checkFriendsOnline = async (req, res) => {
  const user_id = req.user._id;

  try {
    const userProfile = await ProfileModel.findOne({
      user_id: user_id,
    }).populate("friends.user_id");

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendsOnlineStatus = await Promise.all(
      userProfile.friends.map(async (friend) => {
        const friendId = friend.user_id._id.toString();
        const isOnline = await isUserOnline(friendId);
        return {
          friendId: friendId,
          online: isOnline,
        };
      }),
    );

    res.status(200).json(friendsOnlineStatus);
  } catch (err) {
    console.error("Error fetching friends online status", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Cập nhật trạng thái online của người dùng
const setOnline = async (req, res) => {
  const user_id = req.user._id;

  try {
    await setUserOnline(user_id);
    res.status(200).json({ message: `${user_id} is now online` });
  } catch (error) {
    console.error("Error setting user online:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
function setUserOnline(user_id) {
  return new Promise((resolve, reject) => {
    client.setex(user_id, MAX_INACTIVITY_TIME, "online", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Cập nhật trạng thái offline của người dùng
function setUserOffline(user_id) {
  return new Promise((resolve, reject) => {
    client.del(user_id, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
const setOffline = async (req, res) => {
  const user_id = req.user._id;

  try {
    await setUserOffline(user_id);
    res.status(200).json({ message: `${user_id} is now offline` });
  } catch (error) {
    console.error("Error setting user offline:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const checkUserStatus = async (req, res) => {
  const user_id = req.user._id;

  try {
    const isOnline = await isUserOnline(user_id);
    if (!isOnline) {
      // Trạng thái của người dùng là offline nếu không có trong Redis
      return res.status(200).json({ online: false });
    }
    // Nếu người dùng được coi là trực tuyến, cập nhật thời gian hoạt động gần đây
    await client.setex(
      `${user_id}:lastActive`,
      MAX_INACTIVITY_TIME,
      Date.now(),
    );
    res.status(200).send({ online: client.get(user_id) });
  } catch (error) {
    console.error("Error checking user status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

function getLastActiveTime(user_id) {
  return new Promise((resolve, reject) => {
    client.get(`${user_id}:lastActive`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result ? parseInt(result) : 0);
      }
    });
  });
}

const checkUserInactivity = async (req, res, next) => {
  const user_id = req.user._id;

  try {
    const lastActive = await getLastActiveTime(user_id);
    const currentTime = Date.now();
    const timeSinceLastActive = currentTime - lastActive;
    console.log(timeSinceLastActive);
    if (timeSinceLastActive > MAX_INACTIVITY_TIME * 1000) {
      // Nếu thời gian không hoạt động vượt quá ngưỡng cho phép, coi người dùng đã thoát khỏi trang web
      await setUserOffline(user_id);
      return res.status(200).json({ online: false, msg: "User was Offline" });
    } else {
      return res.status(200).json({ msg: "User Still Online" });
    }
  } catch (error) {
    console.error("Error checking user inactivity:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//Lưu bài viết và lấy ra bài viết theo user
const savePostsForUser = async (req, res) => {
  const post_id = req.params.post_id;
  const user_id = req.user._id;
  try {
    const profileData = await ProfileModel.findOne({ user_id: user_id });
    // res.json(profileData);
    if (!profileData) {
      return res.status(400).send({ success: false, msg: "No user in system" });
    }
    const alreadySaved = profileData.save_posts.some(
      (savedPost) => savedPost.post_id.toString() === post_id,
    );
    if (alreadySaved) {
      return res
        .status(400)
        .send({ success: false, msg: "Have already saved this post" });
    }
    profileData.save_posts.push({
      post_id: post_id,
    });
    await profileData.save();
    res.status(200).send({ success: true, data: profileData });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const getMySavedPosts = async (req, res) => {
  const user_id = req.user._id;
  try {
    const data = await ProfileModel.findOne({
      user_id: user_id,
    })
      .populate("save_posts.post_id")
      .select("save_posts");

    if (!data) {
      return res.status(400).send({ success: false, msg: "No user in system" });
    }

    const posts = data.save_posts;

    res.status(200).send({ success: true, data: posts });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};

//Search Profile
const searchProfile = async (req, res) => {
  const keyword = req.query.keyword;
  const page = parseInt(req.query.page) || 1;
  const pageSize = Number(process.env.PAGE_SIZE || 10);

  let query

  if (keyword)
    query = {
      $or: [
        { first_name: { $regex: ".*" + keyword + ".*", $options: "i" } },
        { last_name: { $regex: ".*" + keyword + ".*", $options: "i" } },
      ],
    }

  try {
    const data = await UserModel.find(query)
      .sort({ created: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .select("_id first_name last_name image")
      .exec();

    const count = await UserModel.find(query).countDocuments()
    const totalPage = Math.ceil(count / pageSize);

    const response = {
      success: true,
      totalPage,
      page,
      pageSize,
      items: data
    }

    console.log(response)

    res.status(200).send(response);
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
module.exports = {
  listRecommendFriends,
  listRecommendFriendsPaging,
  listAllFriends,
  listFollowingUser,
  listFollowerUser,
  listFriendRequest,
  create_profile,
  get_profile_by_user,
  get_profile_by_owner,
  update_profile,
  add_experience,
  update_experience,
  add_education,
  update_education,
  follow,
  unfollow,
  add_friend,
  remove_friend,
  accept_friend_request,
  remove_friend_request,
  add_address,
  update_address,
  checkFriendsOnline,
  setOnline,
  setOffline,
  checkUserStatus,
  checkUserInactivity,
  savePostsForUser,
  getMySavedPosts,
  searchProfile,
};
