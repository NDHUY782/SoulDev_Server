const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const path = require("path");
const ProfileController = require("../controllers/profileController");

const multer = require("multer");
const cookieParser = require("cookie-parser");
const { authToken } = require("../config/auth");
const { auth } = require("../middleware/auth");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.use(express.static("public"));

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(
  //     null,
  //     path.join(__dirname, "../public/images/uploads/userImage"),
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

router
  .route("/get-profile-by-userId/:user_id")
  .get(ProfileController.get_profile_by_user);
router
  .route("/get-profile-auth")
  .get(auth, ProfileController.get_profile_by_owner);

router
  .route("/get-recommend-friends")
  .get(auth, ProfileController.listRecommendFriendsPaging);

router.route("/get-all-friends").get(auth, ProfileController.listAllFriends);
router.route("/get-followings").get(auth, ProfileController.listFollowingUser);
router.route("/get-followers").get(auth, ProfileController.listFollowerUser);
router
  .route("/get-friends-requests")
  .get(auth, ProfileController.listFriendRequest);

router.route("/create-profile").post(auth, ProfileController.create_profile);
router.route("/update-profile").post(auth, ProfileController.update_profile);
router.route("/add-address").post(auth, ProfileController.add_address);
router.route("/update-address").post(auth, ProfileController.update_address);
router.route("/add-experience").post(auth, ProfileController.add_experience);

router
  .route("/update-experience/:experience_id")
  .post(ProfileController.update_experience);

router.route("/add-education").post(auth, ProfileController.add_education);

router
  .route("/update-education/:edu_id")
  .post(auth, ProfileController.update_education);

router.route("/follow").post(auth, ProfileController.follow);

router.route("/unfollow").post(auth, ProfileController.unfollow);

router.route("/add-friend").post(auth, ProfileController.add_friend);

router.route("/remove-friend").post(auth, ProfileController.remove_friend);

router
  .route("/accept-friend-request")
  .post(auth, ProfileController.accept_friend_request);
router
  .route("/remove-friend-request")
  .post(auth, ProfileController.remove_friend_request);

router
  .route("/check-friends-online")
  .get(auth, ProfileController.checkFriendsOnline);

router.route("/set-online").post(auth, ProfileController.setOnline);
router.route("/set-offline").post(auth, ProfileController.setOffline);
router.route("/check-status").get(auth, ProfileController.checkUserStatus);
router
  .route("/check-inactivity")
  .get(auth, ProfileController.checkUserInactivity);

router.route("/my-posts-saved").get(auth, ProfileController.getMySavedPosts);

//Search Profile
router.route("/search").get(auth, ProfileController.searchProfile);

module.exports = router;
