const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const CategoryModel = require("../models/CategorySchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");

dotenv.config();

const getListCategories = async (req, res) => {
  try {
    const categoryData = await CategoryModel.find();
    res.status(200).send({ success: true, data: categoryData });
  } catch (error) {
    res.status(400).send({ success: false });
  }
};
const add_category = async (req, res) => {
  try {
    const category_data = await CategoryModel.find();

    if (category_data.length > 0) {
      let checking = false;
      for (let i = 0; i < category_data.length; i++) {
        if (
          category_data[i]["name"].toLowerCase() === req.body.name.toLowerCase()
        ) {
          checking = true;
          break;
        }
      }
      if (checking == false) {
        const category = new CategoryModel({
          name: req.body.name,
          content: req.body.content,
        });
        const categoryData = await category.save();
        res.status(200).send({ success: true, data: categoryData });
      } else {
        res
          .status(200)
          .send({ success: true, msg: "This Category is  already exist" });
      }
    } else {
      const category = new CategoryModel({
        name: req.body.name,
        content: req.body.content,
      });
      const categoryData = await category.save();
      res.status(200).send({ success: true, data: categoryData });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

module.exports = {
  getListCategories,
  add_category,
};
