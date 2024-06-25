const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const GroupModel = require("../models/GroupSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const UserModel = require("../models/UserSchema");

dotenv.config();

// const create_group = async(req,res) => {
//     const user_id = req.params.user_id;
//     const userData = UserModel.findById(user_id)
//     const files = req.files; // Sử dụng req.files thay vì req.file
//     const imageUrls = [];

//     for (const file of files) {
//       const imageBase64 = await getBase64(file.path);
//       const image = await cloudinary.uploadCloudinary(
//         `data:${file.mimetype};base64,${imageBase64}`,
//         file.filename.split(".")[0],
//       );
//       imageUrls.push(image);
//     }

//     if (!userData) {
//         res.status(400).send({success: false, msg:'User is not exist'})
//     }
//     const groupData = new GroupModel({
//         name: req.body.name,
//         image_group: imageUrls,
//         description: req.params.description,
//         code: req.body.code
//       });
//       await groupData.save()

// }
const create_group = async (req, res) => {
  try {
    const { groupName, groupCode } = req.body;
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).json({ error: "User id does not exist" });
    }
    const existingGroup = await GroupModel.find({
      $or: [{ name: groupName }, { code: groupCode }],
    });
    if (existingGroup.length > 0) {
      return res
        .status(400)
        .json({ error: "Group name or code already exists" });
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

    const newGroup = new GroupModel({
      name: groupName,
      code: groupCode,
      image_group: imageUrls,
      creator_id: user_id,
    });

    const groupData = await newGroup.save();
    res.status(201).send({ success: true, data: groupData });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const get_groupByID = async (req, res) => {
  try {
    const group_id = req.params.group_id;
    const groupData = await GroupModel.findById(group_id);
    res.status(200).send({ success: true, data: groupData });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const get_allGroup = async (req, res) => {
  try {
    const groupData = await GroupModel.find();
    res.status(200).send({ success: true, data: groupData });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};

const update_group = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).json({ error: "User id does not exist" });
    }
    const group_id = req.params.group_id;
    const groupData = await GroupModel.findById(group_id);
    if (groupData) {
      const ownData = await GroupModel.findOne({ creator_id: user_id });
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
        const newData = await GroupModel.findByIdAndUpdate(
          { _id: group_id },
          {
            $set: {
              name: name,
              code: code,
              image_group: imageUrls,
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

    // const newGroup = new GroupModel({
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
      const data = await GroupModel.findOneAndDelete({
        _id: group_id,
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

const join_group = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const ownData = await GroupModel.findOne({ creator_id: user_id });
    if (!ownData) {
      const group_id = req.params.group_id;
      const group = await GroupModel.findById(group_id);

      if (group) {
        if (
          group.member_requests &&
          group.member_requests.some(
            (member) => member.user_id.toString() === user_id,
          )
        ) {
          return res.status(400).send({
            success: false,
            msg: "Have already been sent request to join this group",
          });
        }
        if (
          group.members &&
          group.members.some((member) => member.user_id.toString() === user_id)
        ) {
          return res.status(400).send({
            success: false,
            msg: "Have already been a member of this group",
          });
        }
        group.member_requests.unshift({ user_id: user_id });
        await group.save();

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

const join_group_by_link = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group_id = req.params.group_id;
    const groupData = await GroupModel.findById(group_id);
    if (groupData) {
      if (
        groupData.members &&
        groupData.members.some(
          (member) => member.user_id.toString() === user_id,
        )
      ) {
        return res.status(400).send({
          success: false,
          msg: "Have already been sent request to join this group",
        });
      }
      groupData.members.unshift({ user_id: user_id });
      await groupData.save();
      res.status(200).send({ success: true, msg: "Join Group Successfull" });
    } else {
      return res.status(400).send({ success: false, msg: "Group not exist" });
    }
    // console.log('http://localhost:4000/api/group/' + group_id)
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const approve_request_join_group = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group_id = req.params.group_id;
    const group = await GroupModel.findById(group_id);
    if (group) {
      // Duyệt thành nếu là người tạo nhóm
      const requestUser_id = req.body.requestUser_id;
      const ownData = await GroupModel.findOne({ creator_id: user_id });
      if (ownData) {
        if (
          ownData.member_requests &&
          ownData.member_requests.some(
            (member) => member.user_id.toString() !== requestUser_id,
            // console.log(member.user_id)
          )
        ) {
          return res.status(400).send({
            success: false,
            msg: "There is not any request of this user",
          });
        }

        if (!ownData.member_requests) ownData.member_requests = [];

        ownData.member_requests = ownData.member_requests.filter(
          (member) => member.user_id !== requestUser_id,
        );

        ownData.members.unshift({ user_id: requestUser_id });

        await ownData.save();

        return res.status(200).send({ success: true, data: ownData });
      }
      // Duyệt nếu là qtv
      if (
        group.managers &&
        group.managers.some(
          (manager) =>
            manager.user_id.toString() == user_id && manager.role == "admin",
        )
      ) {
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
          (member) => member.user_id !== requestUser_id,
        );

        group.members.unshift({ user_id: requestUser_id });

        await group.save();

        res.status(200).send({ success: true, data: group });
      } else {
        console.log(123);
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

const get_list_member = async (req, res) => {
  const group_id = req.params.group_id;
  const groupData = await GroupModel.findById(group_id);
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
  const user_id = req.user._id;
  const userData = await UserModel.findById(user_id).select("-password");
  if (!userData) {
    return res.status(400).send({ success: false, msg: "User not exist" });
  }
  const group_id = req.params.group_id;
  const group = await GroupModel.findById(group_id);
  if (group) {
    //Add member theo người tạo nhóm
    const { add_mem_id } = req.body;
    const ownData = await GroupModel.findOne({ creator_id: user_id });
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
        group.members.some((member) => member.user_id.toString() === add_mem_id)
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
        res.status(200).send({ success: true, data: group });
      }
    } else {
      group.member_requests.unshift({
        user_id: add_mem_id,
      });
      await group.save();
      res.status(200).send({ success: true, data: group });
    }
  } else {
    res.status(400).send({ success: false, msg: "Group not exist" });
  }
};

const add_manager = async (req, res) => {
  s;
  try {
    const user_id = req.user._id;
    const userData = await UserModel.findById(user_id).select("-password");
    if (!userData) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const group_id = req.params.group_id;
    const groupData = await GroupModel.findOne({
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
    const groupData = await GroupModel.findOne({
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
          (manager) => manager.user_id !== manager_id,
        );
        await groupData.save();
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
    const groupData = await GroupModel.findOne({
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
              (member) => member.user_id !== member_id,
            );
            await groupData.save();
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

module.exports = {
  create_group,
  get_groupByID,
  get_allGroup,
  update_group,
  delete_group,
  join_group,
  join_group_by_link,
  add_member,
  approve_request_join_group,
  get_list_member,
  add_manager,
  remove_manager,
  remove_member,
};
