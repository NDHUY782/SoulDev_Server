const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const PostsController = require("../controllers/postController");
const TestController = require("../controllers/backup");
const { auth } = require("../middleware/auth");
const { authToken } = require("../config/auth");
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

router.get("/upload", (req, res) => {
  res.render("../views/upload.ejs");
});
router.route("/upload").post(upload.array("image"), TestController.add_post);

router.route("/get-posts").get(auth, PostsController.getListPosts);
router
  .route("/get-users-like/:post_id")
  .get(PostsController.getListUsersLikePost);
// router.route("/get-listPaging/:page").get(PostsController.getListPostPaging);

router.route("/random-posts").get(PostsController.get_random_post);

router.route("/count-my-posts").get(auth, PostsController.countMyPosts);

router
  .route("/currentUser")
  .get(auth, PostsController.getListPostsByCurrentUserId);
router.route("/user/:user_id").get(PostsController.getListPostsByUserId);

router.route("/my-posts-shared").get(auth, PostsController.getMyPostsShared);

router.route("/:post_id").get(PostsController.getPostById);

router
  .route("/add-post")
  .post(auth, upload.array("image"), PostsController.add_post);

// router
//   .route("/delete-post/:user_id:posts_id")
//   .post(upload.array("image"), PostsController.delete_post);

router.route("/update-post/:posts_id").post(auth, PostsController.update_post);

router
  .route("/update-post-image/:posts_id")
  .post(auth, upload.array("image"), PostsController.update_post_image);

router.route("/like/:posts_id").post(auth, PostsController.like_post);

router.route("/unlike/:posts_id").post(auth, PostsController.unlike_post);

router.route("/share/:posts_id").post(auth, PostsController.share_post);

router
  .route("/remove-share/:posts_id")
  .post(auth, PostsController.remove_share_post);
// router
//   .route("/update-comment/:user_id/:posts_id/:comment_id")
//   .post(PostsController.update_comment);

//Search Profile
router.route("/search").post(auth, PostsController.searchPosts);
router.route("/search-all").post(auth, PostsController.searchAll);

module.exports = router;
