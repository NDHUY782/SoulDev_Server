const { Schema, model } = require("mongoose");

const ContactModel = new Schema(
  {
    status: {
      type: String,
    },
    email: {
      type: String,
    },
    content: {
      type: String,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model("contacts", ContactModel);
