const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const GroupMediaModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  image_group: {
    type: Array,
  },
  description: {
    type: String,
  },
  managers: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      role: {
        type: String,
        enum: ["admin", "mod"],
        default: "admin",
      },
    },
  ],
  members: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  member_requests: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  created: {
    user_id: Number,
    user_name: String,
    time: Date,
  },
  modified: {
    user_id: Number,
    user_name: String,
    time: Date,
  },
});

module.exports = model("groupsMedia", GroupMediaModel);
