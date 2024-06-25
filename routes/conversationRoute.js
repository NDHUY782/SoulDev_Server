const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { auth } = require("../middleware/auth");
const { authToken } = require("../config/auth");
const ConversationController = require("../controllers/conversationsController");

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

router
  .route("/search")
  .post(auth, ConversationController.searchConversationByNameUser);

router
  .route("/create-chat")
  .post(auth, ConversationController.create_conversation);

router.route("/chat").post(auth, ConversationController.send_message);

router
  .route("/get-my-conversations")
  .get(auth, ConversationController.getAllMyConversations);
router
  .route("/get-list-mess/:conversation_id")
  .get(auth, ConversationController.getListMessInConversation);
router
  .route("/get-list-conversation")
  .get(auth, ConversationController.getListConversation);

router
  .route("/get-conversation/:conversation_id")
  .get(auth, ConversationController.getListConversationByID);

module.exports = router;
