const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const GroupMediaModel = require("../models/GroupMediaSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const UserModel = require("../models/UserSchema");
const PostsModel = require("../models/PostsSchema");
const CommentModel = require("../models/CommentSchema");
const novu = require("../config/novu");
dotenv.config();

const get_allGroup = async (req, res) => {
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
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    //loại trừ những group đã join hoặc đã gửi request
    query.$and = [
      { "members.user_id": { $ne: user_id } },
      { "member_requests.user_id": { $ne: user_id } },
      { creator_id: { $ne: user_id } },
    ];
    const data = await GroupMediaModel.find(query)
      .populate("creator_id")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const itemCount = await GroupMediaModel.find(query).countDocuments().exec();
    const totalPage = Math.ceil(itemCount / pageSize);

    // const allGroups = await GroupMediaModel.find();
    // Lấy số lượng bài post
    const groupsCount = data.length;

    const randomIndexes = [];
    while (randomIndexes.length < groupsCount) {
      const randomIndex = Math.floor(Math.random() * groupsCount);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }

    const randomGroup = randomIndexes.map((index) => data[index]);

    res.status(200).send({
      itemCount,
      totalPage,
      page,
      pageSize,
      items: randomGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false });
  }
};

const get_groupByID = async (req, res) => {
  try {
    const group_id = req.params.group_id;
    const groupData = await GroupMediaModel.findById(group_id)
      .populate("member_requests.user_id")
      .populate("members.user_id");
    res.status(200).send({ success: true, data: groupData });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};

const get_group_joined = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const groups = await GroupMediaModel.find({
      "members.user_id": user_id,
    });
    res.status(200).send({ success: true, data: groups });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const get_group_requested = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const groups = await GroupMediaModel.find({
      "member_requests.user_id": user_id,
    });
    res.status(200).send({ success: true, data: groups });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getListRequestInGroup = async (req, res) => {
  const user_id = req.user._id;
  const group_id = req.params.group_id;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group = await GroupMediaModel.findById(group_id).populate(
      "member_requests.user_id",
    );
    if (!group) {
      return res.status(400).send({ success: false, msg: "Group not exist" });
    }
    const data = group.member_requests;

    // res.json({ myGroups });
    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getMyGroup = async (req, res) => {
  const user_id = req.user._id;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const myGroups = await GroupMediaModel.find({
      creator_id: user_id,
    }).populate("creator_id");

    // res.json({ myGroups });
    res.status(200).send({ success: true, data: myGroups });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const getPostsByGroup = async (req, res) => {
  const group_id = req.params.group_id;
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
      group_id: group_id,
    })
      .populate("group_id")
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

    const rowCount = await PostsModel.find({ query, group_id: group_id })
      .countDocuments()
      .exec();
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
// const get_random_groupMedia = async (req, res) => {
//   try {
//     const allGroups = await GroupMediaModel.find();
//     // Lấy số lượng bài post
//     const postCount = allGroups.length;

//     const randomIndexes = [];
//     while (randomIndexes.length < postCount) {
//       const randomIndex = Math.floor(Math.random() * postCount);
//       if (!randomIndexes.includes(randomIndex)) {
//         randomIndexes.push(randomIndex);
//       }
//     }

//     const randomGroups = randomIndexes.map((index) => allGroups[index]);

//     res.json(randomGroups);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const create_group = async (req, res) => {
  try {
    const { name } = req.body;
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

    const newGroup = new GroupMediaModel({
      name,
      image_group: imageUrls,
      creator_id: user_id,
    });

    newGroup.members.push({ user_id: user_id });
    newGroup.managers.push({ user_id: user_id });

    const groupData = await newGroup.save();
    res.status(201).send({ success: true, data: groupData });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, msg: error.message });
  }
};

const update_group = async (req, res) => {
  const group_id = req.params.group_id;
  const user_id = req.user._id;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).json({ error: "User id does not exist" });
    }

    const groupData = await GroupMediaModel.findById(group_id);
    if (groupData) {
      const ownData = await GroupMediaModel.findOne({
        creator_id: user_id,
        _id: group_id,
      });
      if (ownData) {
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
        const { name, code } = req.body;
        const newData = await GroupMediaModel.findByIdAndUpdate(
          { _id: group_id },
          {
            $set: {
              name: name,
              code: code,
              image_group:
                imageUrls.length !== 0 ? imageUrls : [req.body.image],
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

    // const files = req.files; // Sử dụng req.files thay vì req.file
    // const imageUrls = [];

    // for (const file of files) {
    //   const imageBase64 = await getBase64(file.path);
    //   const image = await cloudinary.uploadCloudinary(
    //     `data:${file.mimetype};base64,${imageBase64}`,
    //     file.filename.split(".")[0],
    //   );
    //   imageUrls.push(image);
    // }

    // const newGroup = new GroupMediaModel({
    //   own_id: own_id,
    //   name: groupName,
    //   code: groupCode,
    //   image_group: imageUrls,
    // });

    // const groupData = await newGroup.save();
    res.status(201).send({ success: true, data: groupData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const delete_group = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (user) {
      const group_id = req.params.group_id;
      const data = await GroupMediaModel.findOneAndDelete({
        _id: group_id,
        creator_id: user_id,
      });
      if (data) {
        res.status(200).json({ success: true, msg: "Delete Successfully" });
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

const join_group = async (req, res) => {
  const group_id = req.params.group_id;
  const user_id = req.user._id;
  try {
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const ownData = await GroupMediaModel.findOne({
      creator_id: user_id,
      _id: group_id,
    });
    if (!ownData) {
      const group = await GroupMediaModel.findById(group_id);
      if (group) {
        const areMemberRequest = group.member_requests.some(
          (member) => member.user_id.toString() === user_id,
        );
        if (areMemberRequest) {
          return res.status(400).send({
            success: false,
            msg: "Have already been sent request to join this group",
          });
        }

        const areMember = group.members.some(
          (member) => member.user_id.toString() === user_id,
        );
        if (areMember) {
          return res.status(400).send({
            success: false,
            msg: "Have already been a member of this group",
          });
        }

        group.member_requests.unshift({ user_id: user_id });
        await group.save();

        await novu.trigger("add-member-in-group-notification", {
          to: {
            subscriberId: group.creator_id.toString(),
          },
          payload: {
            image: userData.image,
            title: `${userData.first_name} ${userData.last_name} đã yêu cầu tham gia nhóm`,
            url: `group-media/${group._id}`,
            urlClient: `/people/${user_id}`,
            type: "success",
          },
        });

        res.status(200).send({ success: true, data: group });
      } else {
        res.status(400).send({ success: false, msg: "Group id is not exist" });
      }
    } else {
      res
        .status(400)
        .send({ success: false, msg: "You r creator of this group" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const approve_request_join_group = async (req, res) => {
  const user_id = req.user._id;
  const group_id = req.params.group_id;
  try {
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group = await GroupMediaModel.findById(group_id);
    if (group) {
      // Duyệt thành nếu là người tạo nhóm
      const requestUser_id = req.body.requestUser_id;
      const ownData = await GroupMediaModel.findOne({
        creator_id: user_id,
        _id: group_id,
      });
      if (ownData) {
        const areMemberRequest = ownData.member_requests.some(
          (member) => member.user_id.toString() === requestUser_id,
        );
        if (!areMemberRequest) {
          return res.status(400).send({
            success: false,
            msg: "There is not any request of this user",
          });
        }

        ownData.members.push({ user_id: requestUser_id });

        if (!ownData.member_requests) ownData.member_requests = [];
        ownData.member_requests = ownData.member_requests.filter(
          (member) => member.user_id.toString() !== requestUser_id,
        );

        const data = await ownData.save();

        return res.status(200).send({ success: true, data: data });
      }
      // Duyệt nếu là qtv
      const areManager = group.managers.some(
        (manager) =>
          manager.user_id.toString() == user_id && manager.role == "admin",
      );
      if (areManager) {
        if (
          group.member_requests &&
          group.member_requests.some(
            (member) => member.user_id.toString() !== requestUser_id,
          )
        ) {
          return res.status(400).send({
            success: false,
            msg: "There is not any request of this user",
          });
        }

        if (!group.member_requests) group.member_requests = [];

        group.member_requests = group.member_requests.filter(
          (member) => member.user_id.toString() !== requestUser_id,
        );

        group.members.unshift({ user_id: requestUser_id });

        await group.save();
        await novu.trigger("accept-member-in-group-notification", {
          to: {
            subscriberId: userData._id.toString(),
          },
          payload: {
            image: group.image_group,
            title: `${userData.first_name} ${userData.last_name} đã được tham gia vào ${group.name}`,
            url: `group-media/${group._id}`,
            urlClient: `/people/${user_id}`,
            type: "success",
          },
        });

        res.status(200).send({ success: true, data: group });
      } else {
        res
          .status(400)
          .send({ success: false, msg: "You cant approve this request" });

        // group.member_requests.unshift({
        //   user_id: add_mem_id
        // })
        // await group.save();
        // res.status(200).send({success: true, data: group})
      }
    } else {
      res.status(400).send({ success: false, msg: "Group is not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const leave_group = async (req, res) => {
  const user_id = req.user._id;
  const group_id = req.params.group_id;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group = await GroupMediaModel.findById(group_id);
    if (!group) {
      return res
        .status(400)
        .send({ success: false, msg: "GroupMedia not exist" });
    }
    const areMember = group.members.some(
      (mem) => mem.user_id.toString() === user_id,
    );
    if (!areMember) {
      return res
        .status(400)
        .send({ success: false, msg: "User not a member in this group" });
    }
    group.members = group.members.filter(
      (mem) => mem.user_id.toString() !== user_id,
    );
    const data = await group.save();
    await novu.trigger("member-leave-group-notification", {
      to: {
        subscriberId: group.creator_id.toString(),
      },
      payload: {
        image: user.image,
        title: `${user.first_name} ${user.last_name} đã rời nhóm`,
        url: `group-media/${group._id}`,
        urlClient: `/people/${user_id}`,
        type: "success",
      },
    });
    res.status(200).send({
      success: true,
      msg: "Leave Group Successfully",
      data: data,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const remove_request_join_group = async (req, res) => {
  const group_id = req.params.group_id;
  const user_id = req.user._id;
  try {
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group = await GroupMediaModel.findById(group_id);
    if (group) {
      const areMember = group.members.some(
        (member) => member.user_id.toString() === user_id,
      );
      if (areMember) {
        return res.status(400).send({
          success: false,
          msg: "Have already been a member of this group",
        });
      }

      const areMemberRequest = group.member_requests.some(
        (member) => member.user_id.toString() === user_id,
      );
      if (!areMemberRequest) {
        return res.status(400).send({
          success: false,
          msg: "User didn't send any request to join this group",
        });
      }

      if (!group.member_requests) group.member_requests = [];
      group.member_requests = group.member_requests.filter(
        (member) => member.user_id.toString() !== user_id,
      );
      await group.save();

      res.status(200).send({ success: true, data: group });
    } else {
      res.status(400).send({ success: false, msg: "Group id is not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const get_list_member = async (req, res) => {
  const group_id = req.params.group_id;
  const groupData = await GroupMediaModel.findById(group_id);
  if (groupData) {
    const userIds = groupData.members.map((member) => {
      return member.user_id;
    });

    const users = await UserModel.find({ _id: userIds });

    const managerIds = groupData.managers.map((manager) => {
      return manager.user_id;
    });

    const managers = await UserModel.find({ _id: managerIds });

    res.status(200).send({
      success: true,
      users: users,
      managers: managers,
    });
  } else {
    res.status(400).send({ success: false, msg: "Group not exist" });
  }
};

const add_member = async (req, res) => {
  const group_id = req.params.group_id;
  const user_id = req.user._id;
  try {
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group = await GroupMediaModel.findById(group_id);
    if (group) {
      //Add member theo người tạo nhóm
      const { add_mem_id } = req.body;
      const ownData = await GroupMediaModel.findOne({
        creator_id: user_id,
        _id: group_id,
      });
      if (ownData) {
        if (
          ownData.members &&
          ownData.members.some(
            (member) => member.user_id.toString() === add_mem_id,
          )
        ) {
          return res.status(400).send({
            success: false,
            msg: "This user have already been a member of this group",
          });
        }
        ownData.members.unshift({
          user_id: add_mem_id,
        });
        await ownData.save();
        await novu.trigger("add-member-in-group-notification", {
          to: {
            subscriberId: userData._id.toString(),
          },
          payload: {
            image: group.image_group,
            title: `Đã được thêm vào nhóm ${group.name}`,
            url: `group-media/${group._id}`,
            urlClient: `/people/${user_id}`,
            type: "success",
          },
        });
        return res.status(200).send({ success: true, data: ownData });
      }
      //Add member theo qtv
      if (
        group.managers &&
        group.managers.some(
          (manager) =>
            manager.user_id.toString() == user_id && manager.role == "admin",
        )
      ) {
        if (
          group.members &&
          group.members.some(
            (member) => member.user_id.toString() === add_mem_id,
          )
        ) {
          res.status(400).send({
            success: false,
            msg: "This user have already been a member of this group",
          });
        } else {
          group.members.unshift({
            user_id: add_mem_id,
          });
          await group.save();

          await novu.trigger("add-member-in-group-notification", {
            to: {
              subscriberId: userData._id.toString(),
            },
            payload: {
              image: group.image_group,
              title: `Đã được thêm vào nhóm ${group.name}`,
              url: `group-media/${group._id}`,
              urlClient: `/people/${user_id}`,
              type: "success",
            },
          });
          res.status(200).send({ success: true, data: group });
        }
      } else {
        group.member_requests.unshift({
          user_id: add_mem_id,
        });
        await group.save();
        await novu.trigger("add-member-in-group-notification", {
          to: {
            subscriberId: group.creator_id.toString(),
          },
          payload: {
            image: userData.image,
            title: `${userData.first_name} ${userData.last_name} đã yêu cầu tham gia nhóm`,
            url: `group-media/${group._id}`,
            urlClient: `/people/${user_id}`,
            type: "success",
          },
        });
        res.status(200).send({ success: true, data: group });
      }
    } else {
      res.status(400).send({ success: false, msg: "Group not exist" });
    }
  } catch (error) {
    console.log(error);
  }
};

const add_manager = async (req, res) => {
  const group_id = req.params.group_id;
  const user_id = req.user._id;
  try {
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const groupData = await GroupMediaModel.findOne({
      _id: group_id,
      creator_id: user_id,
    });
    if (groupData) {
      const manager_id = req.body.manager_id;
      const role = req.body.role;
      if (
        groupData.managers &&
        groupData.managers.some(
          (manager) => manager.user_id.toString() === manager_id,
        )
      ) {
        return res.status(400).send({
          success: false,
          msg: "This user has already been a manager",
        });
      }
      groupData.managers.unshift({
        user_id: manager_id,
        role: role,
      });
      await groupData.save();

      await novu.trigger("add-manager-in-group-notification", {
        to: {
          subscriberId: manager_id,
        },
        payload: {
          image: groupData.image_group,
          title: `${userData.first_name} ${userData.last_name} đã thêm bạn làm manager nhóm ${groupData.name}`,
          url: `group-media/${group_id}`,
          urlClient: `/people/${user_id}`,
          type: "success",
        },
      });
      res.status(200).send({ success: true, data: groupData });
    } else {
      res.status(400).send({ success: false, msg: "Group not exist" });
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
    const group_id = req.params.group_id;
    const groupData = await GroupMediaModel.findOne({
      _id: group_id,
      creator_id: user_id,
    });
    if (groupData) {
      const manager_id = req.body.manager_id;
      if (
        groupData.managers &&
        groupData.managers.some(
          (manager) => manager.user_id.toString() !== manager_id,
        )
      ) {
        res
          .status(400)
          .send({ success: false, msg: "This user is not a manager" });
      } else {
        if (!groupData.managers) groupData.managers = [];
        groupData.managers = groupData.managers.filter(
          (manager) => manager.user_id.toString() !== manager_id,
        );
        await groupData.save();
        await novu.trigger("remove-manager-in-group-notification", {
          to: {
            subscriberId: manager_id,
          },
          payload: {
            image: groupData.image_group,
            title: `${userData.first_name} ${userData.last_name} đã gỡ quyền quản trị viên của bạn trong nhóm ${groupData.name}`,
            url: `group-media/${group_id}`,
            urlClient: `/people/${user_id}`,
            type: "success",
          },
        });
        res.status(200).send({ success: true, data: groupData });
      }
    } else {
      res.status(400).send({ success: false, msg: "Group not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const remove_member = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const group_id = req.params.group_id;
    const groupData = await GroupMediaModel.findOne({
      _id: group_id,
    });
    if (groupData) {
      if (
        groupData.managers &&
        groupData.managers.some(
          (manager) =>
            manager.user_id.toString() == user_id && manager.role == "admin",
        )
      ) {
        const member_id = req.body.member_id;
        if (
          groupData.members &&
          groupData.members.some(
            (member) => member.user_id.toString() !== member_id,
            // console.log(member.user_id)
          )
        ) {
          res.status(400).send({
            success: false,
            msg: "This user is not a member of this group",
          });
        } else {
          if (groupData.members.length == 1) {
            res.status(400).send({
              success: false,
              msg: "just have only 1 member in this group. Cannot delete",
            });
          } else {
            if (!groupData.members) groupData.members = [];
            groupData.members = groupData.members.filter(
              (member) => member.user_id.toString() !== member_id,
            );
            await groupData.save();

            await novu.trigger("remove-member-in-group-notification", {
              to: {
                subscriberId: member_id,
              },
              payload: {
                image: groupData.image_group,
                title: `${userData.first_name} ${userData.last_name} đã xóa bạn khỏi nhóm ${groupData.name}`,
                url: `group-media/${group_id}`,
                urlClient: `/people/${user_id}`,
                type: "success",
              },
            });

            res.status(200).send({ success: true, data: groupData });
          }
        }
      } else {
        res
          .status(400)
          .send({ success: false, msg: "User have no permission" });
      }
    } else {
      res.status(400).send({ success: false, msg: "Group not exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const add_postInGroup = async (req, res) => {
  const group_id = req.body.group_id;
  const user_id = req.user._id;
  try {
    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const groupData = await GroupMediaModel.findById(group_id);
    if (!groupData) {
      return res.status(400).send({ success: false, msg: "Group not exist" });
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

    const newData = new PostsModel({
      group_id: group_id,
      tittle: req.body.tittle,
      name: req.body.name,
      user_id: user_id,
      content: req.body.content,
      images: imageUrls,
    });

    const data = await newData.save();

    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
//----------Update post
const update_post = async (req, res) => {
  const postsID = req.params.posts_id;
  const user_id = req.user._id;
  try {
    const { tittle, name, content } = req.body;
    const updateData = {
      tittle,
      name,
      content,
    };

    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

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
  const user_id = req.user._id;
  const postsID = req.params.posts_id;
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

    const userData = await UserModel.findById(user_id);
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const postsData = await PostsModel.findById(postsID);
    if (!postsData) {
      return res.status(400).send({ success: false, msg: "Post not exist" });
    }
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
const delete_post = async (req, res) => {
  const user_id = req.user._id;
  const post_id = req.params.post_id;
  const group_id = req.body.group_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const group = GroupMediaModel.findById(group_id);
    if (!group) {
      return res.status(400).send({ success: false, msg: "Group not exist" });
    }
    const areManger = group.managers.some(
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
//Search Group
const searchGroupsMedia = async (req, res) => {
  const user_id = req.user._id;
  const search = req.body.search;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "Profile not exist" });
    }
    const data = await GroupMediaModel.find({
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
  getListRequestInGroup,
  getMyGroup,
  get_groupByID,
  get_allGroup,
  get_group_joined,
  get_group_requested,
  getPostsByGroup,
  create_group,
  update_group,
  delete_group,
  join_group,
  remove_request_join_group,
  add_member,
  approve_request_join_group,
  leave_group,
  get_list_member,
  add_manager,
  remove_manager,
  remove_member,
  add_postInGroup,
  update_post,
  update_post_image,
  delete_post,
  searchGroupsMedia,
};
