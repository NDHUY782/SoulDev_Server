const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const ChatGroupModel = new Schema(
  {
    group_id: {
      type: Schema.Types.ObjectId,
      ref: "groups",
      required: [true, "Please provide conversation's ID"],
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

module.exports = model("chatgroups", ChatGroupModel);
