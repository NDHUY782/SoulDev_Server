const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const ConversationModel = new Schema(
  {
    user_id_1: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    user_id_2: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    recent_date: {
      type: Date,
      default: Date.now,
    },
    messages: [
      {
        from: {
          type: Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        to: {
          type: Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        read: {
          type: Boolean,
          default: false,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        show_on_from: {
          // show từ người gửi
          type: Boolean,
          default: true,
        },
        show_on_to: {
          // show từ người nhận
          type: Boolean,
          default: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
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

module.exports = model("conversations", ConversationModel);
