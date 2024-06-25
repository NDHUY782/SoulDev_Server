const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const PostsModel = require("../models/PostsSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const UserModel = require("../models/UserSchema");

dotenv.config();
const add_post = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const userData = await UserModel.findById(user_id);

    const files = req.files; // Sử dụng req.files thay vì req.file
    const imageUrls = [];

    for (const file of files) {
      const imageBase64 = await getBase64(file.path);
      const image = await cloudinary.uploadCloudinary(
        `data:${file.mimetype};base64,${imageBase64}`,
        file.filename.split(".")[0],
      );
      imageUrls.push(image.secure_url);
    }

    const postData = new PostsModel({
      tittle: req.body.tittle,
      name: req.body.name,
      user_id: req.params.user_id,
      content: req.body.content,
      id_category: req.body.id_category,
      images: imageUrls, // Lưu danh sách các URL hình ảnh
    });

    const data = await postData.save();

    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

module.exports = {
  add_post,
};
