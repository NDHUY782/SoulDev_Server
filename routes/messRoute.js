const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { auth } = require("../middleware/auth");
const { authToken } = require("../config/auth");
const MessController = require("../controllers/mesController");

const multer = require("multer");
const cookieParser = require("cookie-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.use(express.static("public"));

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name, function (error1, success1) {
      if (error1) throw error1;
    });
  },
});

const upload = multer({ storage: storage });

router.route("/getAllMess").get(auth, MessController.getAllMess);
router.route("/getMessByID/:messageId").get(auth, MessController.getMessByID);
router
  .route("/createMessage/:chat_group_id")
  .post(authToken, MessController.createMessage);
router
  .route("/update-mess/:messageId")
  .put(authToken, MessController.updateMess);
router
  .route("/delete-mess/:messageId")
  .delete(authToken, MessController.deleteMess);

module.exports = router;
