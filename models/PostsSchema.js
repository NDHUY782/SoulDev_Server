const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const PostsModel = new Schema({
  page_id: {
    type: Schema.Types.ObjectId,
    ref: "pages",
  },
  group_id: {
    type: Schema.Types.ObjectId,
    ref: "groupsMedia",
  },
  tittle: {
    type: String,
  },
  name: {
    type: String,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  content: {
    type: String,
  },
  images: {
    type: Array,
  },
  id_category: {
    type: Schema.Types.ObjectId,
    ref: "categories",
  },
  likes: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true,
      },
    },
  ],
  // comments: [
  //   {
  //     user_id: {
  //       type: String,
  //       ref: "user",
  //       require: true,
  //     },
  //     text: {
  //       type: String,
  //     },
  //     name: {
  //       type: String,
  //     },
  //     avatar: {
  //       type: String,
  //     },
  //     date: {
  //       type: Date,
  //       default: Date.now,
  //     },
  //   },
  // ],
  shares: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true,
      },
      description: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("posts", PostsModel);
