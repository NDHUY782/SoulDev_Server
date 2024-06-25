const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const ChatGroupModel = require("../models/chatGroupSchema");
const MessModel = require("../models/messSchema");
const GroupModel = require("../models/GroupSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const { createToken } = require("../config/auth");

dotenv.config();

const createConversationMember = async (req, res, next) => {
  const { group_id } = req.body;
  // if (!group_id) {
  //     return next(new ErrorResponse("Please provide valid conversation's ID", 400));
  // }

  // if (!user_id) {
  //         return next(new ErrorResponse("Please provide valid user's ID", 400));
  //     }

  try {
    const group = await GroupModel.findById(group_id);
    if (group) {
      const chatgroup = await ChatGroupModel.findOne({ group_id: group_id });
      if (chatgroup) {
        res.status(400).json({
          success: false,
          message: "Group Chat Has already existed",
        });
      } else {
        const member = await ChatGroupModel.create({
          group_id,
        });

        res.status(201).json({
          success: true,
          message: "Create conversation member successfully",
          data: member,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Group not exist",
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteConversationMember = async (req, res, next) => {
  const { chat_group_id } = req.params;

  try {
    const conversation = await ChatGroupModel.findByIdAndDelete(chat_group_id);

    if (!conversation)
      return next(new ErrorResponse("No conversation  found", 404));

    await MessModel.deleteMany({
      chat_group_id: conversation.chat_group_id,
    });

    res.status(200).json({
      success: true,
      message: "Delete conversation data successfully",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversationMember,
  deleteConversationMember,
};
