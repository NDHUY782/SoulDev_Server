const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const MessModel = new Schema(
  {
    chat_group_id: {
      type: Schema.Types.ObjectId,
      ref: "chatgroups",
      required: [true, "Please provide conversation's ID"],
      trim: true,
    },
    group_id: {
      type: Schema.Types.ObjectId,
      ref: "groups",
      required: [true, "Please provide conversation's ID"],
      trim: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide sender's ID"],
      trim: true,
    },
    messageText: {
      type: String,
      required: [true, "Please provide message text"],
      trim: true,
    },
    created: {
      time: Date,
    },
    modified: {
      time: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model("messages", MessModel);
