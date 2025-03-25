const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const UserController = require("../controllers/userController");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const { auth, authRefreshToken } = require("../middleware/auth");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.static("public"));

const storage = multer.diskStorage({
  filename: function (_, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name, function (error) {
      if (error) throw error;
    });
  },
});

const upload = multer({ storage: storage });

router.route("/auth-google").post(UserController.authGoogle);
router.route("/auth-github").post(UserController.authGitHub);

// router.route("/auth-github").post(UserController.authGitHub);

router.route("/get-list").get(auth, UserController.getList);
router.route("/register").post(UserController.register_user);

router.route("/login").post(UserController.userLogin);
router.route("/refresh-token").post(UserController.refreshToken);
router.route("/logout").post(UserController.userLogout);
router
  .route("/complete-onboarding/:_id")
  .post(UserController.completeOnboarding);

router.route("/verify-account").get(UserController.verifyMail);

router.route("/update-password").post(auth, UserController.update_password);

router.route("/forget-password").post(UserController.forget_password);

router.route("/reset-password").put(UserController.reset_password);

router.route("/update-profile").put(auth, UserController.updateProfile);

router
  .route("/update-avatar/:_id")
  .post(auth, upload.single("image"), UserController.updateAvatar);

router.route("/delete-avatar/:user_id").post(auth, UserController.deleteAvatar);

router.route("/current-user").get(auth, UserController.getCurrentUser);

router.route("/current-user/:email").get(UserController.checkCurrentUser);

router.route("/contact").post(UserController.contact);

router.route("/add-user").post(auth, UserController.add_user_for_admin);
router
  .route("/update-user/:user_id")
  .put(auth, UserController.update_user_admin);
router
  .route("/delete-user/:user_id")
  .delete(auth, UserController.delete_user_admin);

router.route("/admin-login").post(UserController.admin_login);
module.exports = router;
