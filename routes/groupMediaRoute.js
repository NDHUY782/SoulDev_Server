const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const GroupMediaController = require("../controllers/groupMediaController");
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

router.route("/").get(auth, GroupMediaController.get_allGroup);

router.route("/my-groups").get(auth, GroupMediaController.getMyGroup);
router.route("/joined").get(auth, GroupMediaController.get_group_joined);
router.route("/requested").get(auth, GroupMediaController.get_group_requested);
router
  .route("/list-request-in-group/:group_id")
  .get(auth, GroupMediaController.getListRequestInGroup);

router.route("/get-posts/:group_id").get(GroupMediaController.getPostsByGroup);

router.route("/:group_id").get(GroupMediaController.get_groupByID);

router
  .route("/create-group")
  .post(auth, upload.array("image"), GroupMediaController.create_group);

router
  .route("/update-group/:group_id")
  .post(auth, upload.array("image"), GroupMediaController.update_group);

router
  .route("/delete-group/:group_id")
  .delete(auth, GroupMediaController.delete_group);
router
  .route("/leave-group/:group_id")
  .delete(auth, GroupMediaController.leave_group);

router
  .route("/join-group/:group_id")
  .post(auth, GroupMediaController.join_group);

router
  .route("/remove-request-join-group/:group_id")
  .post(auth, GroupMediaController.remove_request_join_group);

router
  .route("/accept-request-join-group/:group_id")
  .post(auth, GroupMediaController.approve_request_join_group);

router
  .route("/get-list-member/:group_id")
  .get(GroupMediaController.get_list_member);

router
  .route("/add-member/:group_id")
  .post(auth, GroupMediaController.add_member);

router
  .route("/add-manager/:group_id")
  .post(auth, GroupMediaController.add_manager);

router
  .route("/remove-manager/:group_id")
  .delete(auth, GroupMediaController.remove_manager);
router
  .route("/remove-member/:group_id")
  .post(auth, GroupMediaController.remove_member);
router
  .route("/add-post")
  .post(auth, upload.array("image"), GroupMediaController.add_postInGroup);
router
  .route("/update-post/:posts_id")
  .post(auth, GroupMediaController.update_post);

router
  .route("/update-post-image/:posts_id")
  .post(auth, upload.array("image"), GroupMediaController.update_post_image);

//Search Group
router.route("/search").post(auth, GroupMediaController.searchGroupsMedia);
module.exports = router;
