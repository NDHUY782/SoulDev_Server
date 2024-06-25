const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const CategoryController = require("../controllers/categoryController");

const multer = require("multer");
const cookieParser = require("cookie-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(
    //   null,
    //   path.join(__dirname, "../public/images/uploads/userImage"),
    //   function (error, success) {
    //     if (error) throw error;
    //   },
    // );
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name, function (error1, success1) {
      if (error1) throw error1;
    });
  },
});

const upload = multer({ storage: storage });

router.route("/").get(CategoryController.getListCategories);

router.route("/add-category").post(CategoryController.add_category);

module.exports = router;
