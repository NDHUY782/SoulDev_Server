const { Schema, model } = require("mongoose");

const UserModel = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    image: {
      type: String,
    },
    email: {
      type: String,
      require: true,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    password: {
      type: String,
      default: "jhdsyguysdgfy",
    },
    authType: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    mobile: {
      type: String,
    },
    is_verified: {
      type: Number,
      default: 0,
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
    token: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      // default: "",
    },
    isOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
    },
    twiter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    github: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model("users", UserModel);
