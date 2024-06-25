const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const ConversationModel = require("../models/ConversationSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const { createToken } = require("../config/auth");

dotenv.config();
const getAllMyConversations = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";
  if (keyword) {
    query = {
      $or: [{ text: keyword }],
    };
  }
  const pageSize = Number(process.env.PAGE_SIZE || 10);

  const user_id = req.user._id;
  try {
    const user = await UserModel.findById(user_id).exec();
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }
    const query = {
      $or: [{ user_id_1: user_id }, { user_id_2: user_id }],
    };
    const conversations = await ConversationModel.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("user_id_1", "_id first_name last_name image")
      .populate("user_id_2", "_id first_name last_name image")
      .populate("messages.from", "_id first_name last_name image")
      .populate("messages.to", "_id first_name last_name image")
      .exec();
    res.status(200).send({
      success: true,
      page,
      pageSize,
      items: conversations,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: message.error });
  }
};
const send_message = async (req, res) => {
  const user_id = req.user._id;
  const { conversation_id, toUser_id, text } = req.body;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const toUser = await UserModel.findById(user_id).select("-password");
    if (!toUser) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    // if (!conversation_id) {
    //   let newConversation = await ConversationModel.findOne({
    //     $or: [
    //       { $and: [{ user_id_1: user_id }, { user_id_2: toUser_id }] },
    //       { $and: [{ user_id_1: toUser_id }, { user_id_2: user_id }] },
    //     ],
    //   }).exec();
    //   if (newConversation) {
    //     newConversation.messages.unshift({
    //       to: toUser_id,
    //       text: text,
    //       from: user_id,
    //     });
    //   } else {
    //     const newConversation = new ConversationModel({
    //       user_id_1: user_id,
    //       user_id_2: toUser_id,
    //       messages: [
    //         {
    //           from: user_id,
    //           to: toUser_id,
    //           text: text,
    //         },
    //       ],
    //     });
    //     await newConversation.save();
    //     res.status(200).send({ success: true, data: newConversation });
    //   }
    // } else {
    const conversation = await ConversationModel.findById(conversation_id)
      .populate("user_id_1")
      .populate("user_id_2")
      .populate("messages.from")
      .populate("messages.to");
    if (conversation) {
      if (
        (conversation.user_id_1._id.toString() !== user_id &&
          conversation.user_id_1._id.toString() !== toUser_id) ||
        (conversation.user_id_2._id.toString() !== toUser_id &&
          conversation.user_id_2._id.toString() !== user_id)
      ) {
        return res
          .status(400)
          .send({ success: false, msg: "Conversation id is not valid" });
      }
      conversation.messages.push({
        to: toUser_id,
        text: text,
        from: user_id,
      });

      const data = await conversation.save();

      res.status(200).send({ success: true, data: data });
    } else {
      res.status(200).send({ success: false, msg: "Conversation not exist" });
    }
    // }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
const create_conversation = async (req, res) => {
  const user_id = req.user._id;
  const { toUser_id } = req.body;
  try {
    const user = await UserModel.findById(user_id).select("-password");
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const toUser = await UserModel.findById(toUser_id).select("-password");
    if (!toUser) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const conversation = await ConversationModel.create({
      user_id_1: user_id,
      user_id_2: toUser_id,
    });
    res.json({ conversation });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const getListMessInConversation = async (req, res) => {
  const user_id = req.user._id;
  const conversation_id = req.params.conversation_id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = Number(process.env.MESS_SIZE || 15);

  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(400).send({ success: false, msg: "User not exist" });
    }

    const conversation = await ConversationModel.findById(conversation_id)
      .populate("user_id_1", "_id first_name last_name image")
      .populate("user_id_2", "_id first_name last_name image")
      .populate("messages.from", "_id first_name last_name image")
      .populate("messages.to", "_id first_name last_name image");

    if (!conversation) {
      return res
        .status(400)
        .send({ success: false, msg: "Conversation not exist" });
    }

    const data = conversation.messages.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const startIndex = (page - 1) * pageSize;
    const paginatedMessages = data.slice(startIndex, startIndex + pageSize);
    const totalMessages = data.length;
    const totalPage = Math.ceil(totalMessages / pageSize);

    res.status(200).send({
      success: true,
      page,
      pageSize,
      totalPage: totalPage,
      items: paginatedMessages,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const getListConversation = async (req, res) => {
  const user_id = req.user._id;
  const keyword = req.query.keyword || "";

  let query = {
    $or: [{ user_id_1: user_id }, { user_id_2: user_id }],
  };

  try {
    if (keyword) {
      const data = await UserModel.find({
        $or: [
          { first_name: { $regex: ".*" + keyword + ".*", $options: "i" } },
          { last_name: { $regex: ".*" + keyword + ".*", $options: "i" } },
        ],
      });

      const userIds = data.map((id) => id._id);

      query = {
        $or: [{ user_id_1: { $in: userIds } }, { user_id_2: { $in: userIds } }],
      };
    } else {
      const user = await UserModel.findById(user_id).select("-password");

      if (!user) {
        return res.status(400).send({ success: false, msg: "User not exist" });
      }
    }

    const conversations = await ConversationModel.find(query)
      .populate("user_id_1", "_id first_name last_name image")
      .populate("user_id_2", "_id first_name last_name image")
      .sort({ recent_date: -1 })
      .exec();

    res.status(200).send({ success: true, data: conversations });
  } catch (error) {
    res.status(400).send({ success: false, msg: message.error });
  }
};

const getListConversationByID = async (req, res, next) => {
  const conversation_id = req.params.conversation_id;

  try {
    const conversation = await ConversationModel.findById(conversation_id)
      .populate("user_id_1", "_id first_name last_name image")
      .populate("user_id_2", "_id first_name last_name image")
      .populate("messages.from", "_id first_name last_name image")
      .populate("messages.to", "_id first_name last_name image");

    if (!conversation)
      return next(new ErrorResponse("No conversation found", 404));

    res.status(200).json({
      success: true,
      message: "Get conversation successfully",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

const searchConversationByNameUser = async (req, res) => {
  const user_id = req.user._id;
  const search = req.body.search;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(200).send({ success: false, msg: "Profile not exist" });
    }

    const data = await UserModel.find({
      $or: [
        { first_name: { $regex: ".*" + search + ".*", $options: "i" } },
        { last_name: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });
    const userIds = data.map((id) => id._id);
    const conversations = await ConversationModel.find({
      $or: [{ user_id_1: { $in: userIds } }, { user_id_2: { $in: userIds } }],
    })
      .populate("user_id_1", "_id first_name last_name image")
      .populate("user_id_2", "_id first_name last_name image")
      .populate("messages.from", "_id first_name last_name image")
      .populate("messages.to", "_id first_name last_name image")
      .exec();
    res.status(200).send({ success: true, data: conversations });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};

module.exports = {
  create_conversation,
  getAllMyConversations,
  send_message,
  getListMessInConversation,
  getListConversation,
  getListConversationByID,
  searchConversationByNameUser,
};
