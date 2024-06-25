const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const CommentController = require("../controllers/commentController");
const TestController = require("../controllers/backup");
const { auth } = require("../middleware/auth");

const multer = require("multer");
const cookieParser = require("cookie-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.use(express.static("public"));

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(
  //     null,
  //     path.join(__dirname, "../public/images/uploads/postImage"),
  //     function (error, success) {
  //       if (error) throw error;
  //     },
  //   );
  // },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name, function (error1, success1) {
      if (error1) throw error1;
    });
  },
});

const upload = multer({ storage: storage });

router.route("/get-comments/:post_id").get(CommentController.getComments);
router
  .route("/add-comment/:posts_id")
  .post(auth, upload.array("image"), CommentController.add_comment);

router
  .route("/update-comment/:posts_id/:comment_id")
  .post(auth, CommentController.update_comment);

router
  .route("/update-image/:posts_id/:comment_id")
  .post(auth, upload.array("image"), CommentController.update_commentImage);

router
  .route("/delete-comment/:posts_id/:comment_id")
  .delete(auth, CommentController.delete_comment);

module.exports = router;
