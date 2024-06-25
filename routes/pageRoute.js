const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const PageController = require("../controllers/pageController");
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
router.route("/count-my-posts").get(auth, PageController.countMyPosts);

router.route("/get-pages").get(auth, PageController.getListPages);
router.route("/get-page-byId/:page_id").get(PageController.getPageById);
router.route("/get-posts/:page_id").get(PageController.getPostsByPage);

router.route("/my-pages").get(auth, PageController.getMyPages);
router.route("/get-liked-pages").get(auth, PageController.get_liked_pages);
router
  .route("/get-followed-pages")
  .get(auth, PageController.get_followed_pages);

router.route("/random-posts").get(PageController.get_random_post);

router
  .route("/create")
  .post(auth, upload.array("image"), PageController.createPage);
router
  .route("/update/:page_id")
  .put(auth, upload.array("image"), PageController.updatePage);
router.route("/delete").delete(auth, PageController.deletePage);

router.route("/add-manager").post(auth, PageController.add_manager);
router.route("/remove-manager").post(auth, PageController.remove_manager);

router
  .route("/add-post")
  .post(auth, upload.array("image"), PageController.up_post_inPage);
router
  .route("/update-post/:posts_id")
  .post(auth, PageController.update_post_inPage);

router
  .route("/update-post-image/:posts_id")
  .post(auth, upload.array("image"), PageController.update_post_image_inPage);

router.route("/like-page/:page_id").post(auth, PageController.likePage);
router.route("/unlike-page/:page_id").post(auth, PageController.unLikePage);

router.route("/follow-page/:page_id").post(auth, PageController.followPage);
router.route("/unfollow-page/:page_id").post(auth, PageController.unFollowPage);

//Search Page
router.route("/search").post(auth, PageController.searchPages);
module.exports = router;
