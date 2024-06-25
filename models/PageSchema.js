const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const PageModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  image_page: {
    type: Array,
  },
  email: {
    type: String,
    require: true,
  },
  website: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  followers: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true,
      },
    },
  ],
  likes: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true,
      },
    },
  ],
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
        enum: ["admin", "manager"],
        default: "admin",
      },
    },
  ],
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

module.exports = model("pages", PageModel);
