const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");

const ProfileModel = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
    company: {
      type: String,
    },
    website: {
      type: String,
    },
    linkedIn: {
      type: String,
    },
    address: [
      {
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        ward: {
          type: String,
        },
        location: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
    },
    skills: {
      type: [String],
      required: true,
    },
    experience: [
      {
        title: {
          type: String,
          required: true,
        },
        company: {
          type: String,
          required: true,
        },
        location: {
          type: String,
        },
        from: {
          type: String,
          required: true,
        },
        to: {
          type: String,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    education: [
      {
        school: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        from: {
          type: String,
          required: true,
        },
        to: {
          type: String,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    followings: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "users",
          require: true,
        },
      },
    ],
    followers: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "users",
          require: true,
        },
      },
    ],
    friends: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "users",
          require: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    friend_requests: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "users",
          require: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    save_posts: [
      {
        post_id: {
          type: Schema.Types.ObjectId,
          ref: "posts",
          require: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = model("profiles", ProfileModel);
