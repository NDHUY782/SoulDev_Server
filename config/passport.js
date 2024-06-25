var LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const UserModel = require("../models/UserSchema");
const FacebookTokenStrategy = require("passport-facebook-token");

require("dotenv").config();

module.exports = (passport) => {
  //Passport Git
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        // Kiểm tra xem người dùng đã đăng nhập bằng GitHub trước đó chưa
        await UserModel.findOne({ githubId: profile.id }, (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            // Nếu người dùng chưa tồn tại trong cơ sở dữ liệu, tạo mới người dùng
            const newUser = new UserModel({
              githubId: profile.id,
              email: profile.emails[0].value, // Lấy email từ thông tin GitHub
              // Có thể thêm các trường thông tin khác của người dùng ở đây
            });
            newUser.save((err, savedUser) => {
              if (err) {
                return done(err);
              }
              return done(null, savedUser);
            });
          } else {
            // Nếu người dùng đã tồn tại trong cơ sở dữ liệu, trả về thông tin người dùng
            return done(null, user);
          }
        });
      },
    ),
  );
};
