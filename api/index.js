require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const logger = require("morgan");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const moment = require("moment-timezone");
const socket = require("socket.io");
const client = require("../config/connect_redis");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// client.set("foo", "NguyenDucHuy");
const ConversationModel = require("../models/ConversationSchema");
// client.get("foo", (err, result) => {
//   if (err) {
//     return err;
//   }
//   console.log(result);
// });
// Set timezone for moment & dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");
const tz7 = "Asia/Bangkok";
moment.tz.setDefault(tz7);

const { connectDB } = require("../config/db");

const userRoute = require("../routes/userRoute");
const categoryRoute = require("../routes/categoryRoute");
const postRoute = require("../routes/postRoute");
const pageRoute = require("../routes/pageRoute");
const commentRoute = require("../routes/commentRoute");
const profileRoute = require("../routes/profileRoute");
const groupRoute = require("../routes/groupRoute");
const groupMediaRoute = require("../routes/groupMediaRoute");
const conversationRoute = require("../routes/conversationRoute");
const chatGroupRoute = require("../routes/chatGroupRoute");
const messRoute = require("../routes/messRoute");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../lib/swagger.json");
const UserSchema = require("../models/UserSchema");

connectDB();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use(express.json({ limit: "4mb" }));
app.use(helmet());
app.use(cors());
app.use(cookieParser());
// app.use(logger.express);
app.use(
  logger("dev", {
    skip: function (req) {
      if (req.url.indexOf("socket") >= 0) {
        return true;
      }
      return false;
    },
  }),
);
const swaggerOptions = {
  swaggerDefinition: swaggerDocument,
  apis: ["index.js", "../routes/*.js", "../middleware/*.js", "../models/*.js"],
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//root route
app.get("/", (req, res) => {
  res.send("App works properly!");
});

app.use("/api/users/", userRoute);
app.use("/api/category/", categoryRoute);
app.use("/api/post", postRoute);
app.use("/api/page", pageRoute);
app.use("/api/comment/", commentRoute);
app.use("/api/profile/", profileRoute);
app.use("/api/group/", groupRoute);
app.use("/api/group-media/", groupMediaRoute);
app.use("/api/conversation/", conversationRoute);
app.use("/api/chat-group/", chatGroupRoute);
app.use("/api/send-mess/", messRoute);

// Use express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});

// Serve static files from the "dist" directory
// app.use(express.static(path.join(__dirname, "build")));
app.use("/static", express.static("public"));

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);

const io = socket(server, {
  cors: {
    origin: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  const userId = socket.handshake.query.userId;
  onlineUsers.set(userId, socket.id);

  socket.emit("USERS_ONLINE", Array.from(onlineUsers.keys()));

  socket.on("SEND_MESSAGE", async (data) => {
    try {
      const sendUserSocket = onlineUsers.get(data.to);
      const { from, to, text } = data;

      const sender = await UserSchema.findById(from).exec();
      const receiver = await UserSchema.findById(to).exec();

      let conversation = await ConversationModel.findOne({
        $or: [
          { $and: [{ user_id_1: from }, { user_id_2: to }] },
          { $and: [{ user_id_1: to }, { user_id_2: from }] },
        ],
      }).exec();

      if (!conversation) {
        return res
          .status(400)
          .send({ success: false, msg: "Dont have conversation" });
      }
      conversation.messages.push({ from, to, text });

      const savedConversation = await conversation.save();

      const message = {
        from: sender,
        to: receiver,
        text,
        date: Date.now(),
      };

      const receiveData = {
        conversationId: savedConversation._id,
        message,
      };

      socket.emit("RECEIVE_MESSAGE", receiveData);

      sendUserSocket &&
        socket.to(sendUserSocket).emit("RECEIVE_MESSAGE", receiveData);
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  });

  socket.on('TYPING', (data) => {
    console.log(data);
    socket.to(onlineUsers.get(data.to)).emit('TYPING', data);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    socket.emit("USERS_ONLINE", Array.from(onlineUsers.keys()));
  });
});
