const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const CommentModel = new Schema({
  post_id: {
    type: Schema.Types.ObjectId,
    ref: "posts",
    require: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  text: {
    type: String,
  },
  image: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now,
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

module.exports = model("comments", CommentModel);
