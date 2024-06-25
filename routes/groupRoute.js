const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const GroupController = require("../controllers/groupController");
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

router.route("/").get(GroupController.get_allGroup);
router.route("/:group_id").get(GroupController.get_groupByID);

router
  .route("/create-group")
  .post(auth, upload.array("image"), GroupController.create_group);

// router
//   .route("/join-group-by-link/:user_id/:group_id")
//   .post(auth, GroupController.join_group_by_link);

router
  .route("/update-group/:group_id")
  .post(auth, upload.array("image"), GroupController.update_group);

router
  .route("/delete-group/:group_id")
  .delete(auth, GroupController.delete_group);

router.route("/join-group/:group_id").post(auth, GroupController.join_group);

router
  .route("/accept-request-join-group/:group_id")
  .post(auth, GroupController.approve_request_join_group);

router.route("/get-list-member/:group_id").get(GroupController.get_list_member);

router.route("/add-member/:group_id").post(auth, GroupController.add_member);

router.route("/add-manager/:group_id").post(auth, GroupController.add_manager);

router
  .route("/remove-manager/:group_id")
  .delete(auth, GroupController.remove_manager);
router
  .route("/remove-member/:group_id")
  .post(auth, GroupController.remove_member);

module.exports = router;
