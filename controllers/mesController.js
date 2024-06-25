const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const ChatGroupModel = require("../models/chatGroupSchema");
const MessModel = require("../models/messSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const { createToken } = require("../config/auth");

dotenv.config();

const getAllMess = async (req, res, next) => {
  try {
    const group_id = req.body.group_id;
    const message = await MessModel.find({
      group_id: group_id,
    });

    if (!message) return next(new ErrorResponse("No message found", 404));

    res.status(200).json({
      success: true,
      message: "Get message successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
const getMessByID = async (req, res, next) => {
  const { messageId } = req.params;
  const group_id = req.body.group_id;

  try {
    const message = await MessModel.findById({
      _id: messageId,
      group_id: group_id,
    });

    if (!message) return next(new ErrorResponse("No message found", 404));

    res.status(200).json({
      success: true,
      message: "Get message successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  const { group_id, messageText } = req.body;
  const user_id = req.user._id;

  const chat_group_id = req.params.chat_group_id;

  const chatGroup = await ChatGroupModel.findById(chat_group_id);
  if (!chatGroup) {
    return res.status(400).send({
      success: false,
      msg: "Chat Group not Exist",
    });
  }

  try {
    const message = new MessModel({
      chat_group_id: chat_group_id,
      group_id: group_id,
      user_id: user_id,
      messageText: messageText,
    });
    await message.save();

    res.status(201).json({
      success: true,
      message: "Create message successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

const updateMess = async (req, res) => {
  const { messageId } = req.params;
  const { group_id, messageText } = req.body;
  const user_id = req.user._id;

  // if (!messageId || !mongoose.Types.ObjectId.isValid(messageId))
  //     return next(new ErrorResponse("Please provide valid message's ID", 400));

  try {
    const data = await MessModel.findById({
      group_id: group_id,
      _id: messageId,
      user_id: user_id,
    });
    if (data) {
      const message = await MessModel.findByIdAndUpdate(messageId, {
        messageText,
      });

      if (!message) {
        return res
          .status(404)
          .send({ success: false, msg: "No message found" });
      }

      res.status(201).json({
        success: true,
        message: "Update message successfully",
        data: message,
      });
    } else {
      return res.status(404).send({ success: false, msg: "No message found" });
    }
  } catch (error) {
    next(error);
  }
};
const deleteMess = async (req, res) => {
  const { messageId } = req.params;
  const user_id = req.user._id;
  const group_id = req.body.group_id;

  try {
    const data = await MessModel.findById({
      group_id: group_id,
      _id: messageId,
      user_id: user_id,
    });
    if (data) {
      const message = await MessModel.findByIdAndDelete(messageId);
      if (!message) {
        return res
          .status(404)
          .send({ success: false, msg: "No message found" });
      }

      res.status(201).json({
        success: true,
        message: "Delete message successfully",
      });
    } else {
      return res.status(404).send({ success: false, msg: "No message found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMess,
  getMessByID,
  createMessage,
  updateMess,
  deleteMess,
};
