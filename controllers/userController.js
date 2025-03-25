const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const randormString = require("randomstring");
const nodemailer = require("nodemailer");
const ContactModel = require("../models/ContactSchema");
const dotenv = require("dotenv");
const getBase64 = require("../helpers/image");
const cloudinary = require("../config/cloudinary");
const { createToken, createRefreshToken } = require("../config/auth");
const { authRefreshToken } = require("../middleware/auth");
const {
  emailVerifyTemplate,
  emailResetPasswordTemplate,
} = require("../lib/email-template");
const client = require("../config/connect_redis");
const novu = require("../config/novu");

dotenv.config();
const getList = async (req, res) => {
  try {
    const data = await UserModel.find();
    res.status(200).send({ data: data });
  } catch (error) {
    res.status(400).send({ msg: "fail" });
  }
};
// Auth with GitHub
const authGitHub = async (req, res) => {
  const email = req.body.email;
  const userData = await UserModel.findOne({ email: email });
  const spassword = await securePassword(req.body.password);

  try {
    if (userData) {
      const tokenData = await createToken(userData._id, email);

      const userResult = {
        _id: userData._id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        image: userData.image,
        mobile: userData.mobile,
        token: tokenData,
        isOnboardingCompleted: userData.isOnboardingCompleted,
      };

      return res.status(200).send({
        success: true,
        data: userResult,
      });
    } else {
      const user = new UserModel({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        image: req.body.image,
        password: spassword,
        is_verified: 1,
        authType: "github",
      });

      const registeredUser = await user.save();

      if (registeredUser) {
        const token = await createToken(registeredUser._id, email);

        const subscriberId = registeredUser._id;

        await novu.subscribers.identify(subscriberId, {
          email: registeredUser.email,
          firstName: registeredUser.first_name,
          lastName: registeredUser.last_name,
        });

        const data = { ...registeredUser, token };

        return res.status(200).send({
          success: true,
          data,
          msg: "Đăng tài khoản thành công!",
        });
      } else {
        return res
          .status(500)
          .send({ success: false, msg: "Đăng ký thất bại!" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lỗi server!" });
  }
};

// Auth with Google
const authGoogle = async (req, res) => {
  const email = req.body.email;
  const userData = await UserModel.findOne({ email: email });
  const spassword = await securePassword(req.body.password);

  try {
    if (userData) {
      const tokenData = await createToken(userData._id, email);

      const userResult = {
        _id: userData._id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        image: userData.image,
        mobile: userData.mobile,
        token: tokenData,
        isOnboardingCompleted: userData.isOnboardingCompleted,
      };

      return res.status(200).send({
        success: true,
        data: userResult,
      });
    } else {
      const user = new UserModel({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        image: req.body.image,
        password: spassword,
        is_verified: 1,
        authType: "google",
      });

      const registeredUser = await user.save();

      if (registeredUser) {
        const token = await createToken(registeredUser._id, email);
        const subscriberId = registeredUser._id;

        await novu.subscribers.identify(subscriberId, {
          email: registeredUser.email,
          firstName: registeredUser.first_name,
          lastName: registeredUser.last_name,
        });

        const data = { ...registeredUser, token };

        return res.status(200).send({
          success: true,
          data,
          msg: "Đăng tài khoản thành công!",
        });
      } else {
        return res
          .status(500)
          .send({ success: false, msg: "Đăng ký thất bại!" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lỗi server!" });
  }
};

// Check current user
const checkCurrentUser = async (req, res) => {
  const email = req.params.email;
  try {
    const user = await UserModel.findOne({ email: email });

    res.status(200).json({ data: user, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Lỗi server!" });
  }
};
// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id).select(
      "-password -token -__v",
    );

    res.status(200).json({ data: user, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Lỗi server!" });
  }
};

// -----Phần Cho Mail--------------------------------------
//gửi mail reset password
const sendResetPasswordMail = async (
  first_name,
  last_name,
  email,
  token,
  res,
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORKD, // generated ethereal password
      },
    });
    const mailOption = {
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "Reset Password | SoulDev", // Subject line
      html: emailResetPasswordTemplate({ first_name, last_name, token }),
    };

    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//gửi mail contact
const sendContactMail = async (firstname, lastname, email, token, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORKD, // generated ethereal password
      },
    });

    const mailOption = {
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "Thanks For Contact", // Subject line
      text: "Xin Cảm Ơn - Chúc Bạn Có 1 Ngày Tốt Lành", // plain text body
      html:
        "<p>Xin Chào " +
        firstname +
        " " +
        lastname +
        "," +
        "Cảm ơn bạn để liên hệ với chúng tôi </a>.</p>",
    };
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

// gửi mail xác thực tài khoản
const sendMailVerified = async (first_name, last_name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORKD,
      },
    });

    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Account - SoulDev",
      html: emailVerifyTemplate({ user_id, first_name, last_name }),
    };

    transporter.sendMail(mailOption, function (error) {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//mã hóa password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//đăng ký user
const register_user = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    const user = new UserModel({
      password: spassword,
      email: req.body.email,
      mobile: req.body.mobile,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    });

    const userEmail = await UserModel.findOne({ email: req.body.email });
    if (userEmail) {
      res.status(400).send({ success: false, msg: "Email đã được sử dụng" });
    } else {
      const user_data = await user.save();
      if (user_data) {
        sendMailVerified(
          req.body.first_name,
          req.body.last_name,
          req.body.email,
          user_data._id,
        );

        const subscriberId = user_data._id;

        await novu.subscribers.identify(subscriberId, {
          email: user_data.email,
          firstName: user_data.first_name,
          lastName: user_data.last_name,
        });

        res.status(200).send({
          success: true,
          msg: "ur registration has been successfully, Please check ur mail to verify",
        });
      } else {
        res
          .status(400)
          .send({ success: false, msg: "ur registration has been failure" });
      }
      res.status(200).send({ success: true, data: user_data });
    }
  } catch (error) {
    console.log(error);
  }
};

//verified register
const verifyMail = async (req, res) => {
  try {
    const _id = req.query.id;
    await UserModel.findByIdAndUpdate(_id, { is_verified: 1 });
    res.redirect(`${process.env.CLIENT_URL}/auth/verify-success`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.CLIENT_URL}/auth/verify-error`);
  }
};

//đăng nhập user
const userLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await UserModel.findOne({ email: email });

    if (userData) {
      const password_Login = await bcrypt.compare(password, userData.password);

      if (password_Login) {
        if (userData.is_verified === 0) {
          res
            .status(400)
            .send({ success: false, msg: "Tài Khoản chưa được xác thực" });
        } else {
          const tokenData = await createToken(userData._id, email);
          const refreshTokenData = await createRefreshToken(
            userData._id,
            email,
          );

          const userResult = {
            _id: userData._id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            image: userData.image,
            mobile: userData.mobile,
            token: tokenData,
            refreshToken: refreshTokenData,
            isOnboardingCompleted: userData.isOnboardingCompleted,
          };
          const response = {
            success: true,
            message: "Đăng nhập thành công",
            data: userResult,
          };
          res.status(200).send(response);
        }
      } else {
        res.status(200).send({
          success: false,
          msg: "Tài khoản hoặc mật khẩu không chính xác!",
        });
      }
    } else {
      res.status(200).send({
        success: false,
        msg: "Tài khoản hoặc mật khẩu không chính xác!",
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Token invalid" });
    }
    // const dataAccess_Token = await authRefreshToken(refreshToken);
    const { _id } = await authRefreshToken(refreshToken);
    const tokenData = await createToken(_id);
    const refreshTokenData = await createRefreshToken(_id);
    res.status(200).send({
      access_token: tokenData,
      refresh_token: refreshTokenData,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};
const userLogout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ msg: "Token invalid" });
    }
    const { _id } = await authRefreshToken(refreshToken);

    client.del(_id, (err, reply) => {
      if (err) {
        console.error("Error deleting refresh token from cache:", err);
        return res.status(500).json({ msg: "Internal Server Error" });
      }
      res.status(200).send({ msg: "Logout Successfully" });
    });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
//Update Pass
const update_password = async (req, res) => {
  try {
    const user_id = req.user._id;
    const password = req.body.password;

    const data = await UserModel.findOne({ _id: user_id });
    if (data) {
      const newPassword = await securePassword(password);

      await UserModel.findByIdAndUpdate(
        { _id: user_id },
        {
          set: {
            password: newPassword,
          },
        },
        { new: true },
      );

      res.status(200).send({ success: true, msg: "Password được cập nhật" });
    } else {
      res
        .status(400)
        .send({ success: false, msg: "User Id không được tìm thấy" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//quên password
const forget_password = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await UserModel.findOne({ email });

    if (userData) {
      const randomString = randormString.generate();
      const data = await UserModel.updateOne(
        { email: email },
        { $set: { token: randomString } },
      );
      sendResetPasswordMail(
        userData.first_name,
        userData.last_name,
        userData.email,
        randomString,
        res,
      );
      res.status(200).send({
        success: true,
        msg: "Hãy Kiểm Tra Mail Của Bạn Và Đổi Password Của Bạn",
      });
    } else {
      res
        .status(400)
        .send({ success: false, msg: "Tài Khoản Email Không Chính Xác" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

//reset password
const reset_password = async (req, res) => {
  try {
    const password = req.body.password;
    const newPassword = await securePassword(password);
    const tokenData = await UserModel.findOne({ token: req.body.token });

    if (tokenData) {
      const userData = await UserModel.findByIdAndUpdate(
        tokenData._id,
        { $set: { password: newPassword, token: "" } },
        { new: true },
      );
      res.status(200).send({
        success: true,
        msg: "Password Đã Được Thay Đổi",
        data: userData,
      });
    } else {
      res.status(400).send({ success: false, msg: "Đường Dẫn Không Tồn Tại" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const contact = async (req, res, next) => {
  try {
    const contact = new ContactModel({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      mobile: req.body.mobile,
      content: req.body.content,
    });

    const user_data = await contact.save();
    sendContactMail(
      user_data.firstname,
      user_data.lastname,
      user_data.email,
      res,
    );
    res.status(200).send({ success: true, data: user_data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: req.body,
      },
      { new: true },
    );

    return res.status(200).send({ success: true, userData: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
    next();
  }
};

const updateAvatar = async (req, res) => {
  try {
    const results = req.file;
    const user_id = req.params._id;

    const imageBase64 = await getBase64(results.path);
    const image = await cloudinary.uploadCloudinary(
      `data:${results.mimetype};base64,${imageBase64}`,
      results.filename.split(".")[0],
    );
    const updateData = {
      image,
    };

    const data = await UserModel.findByIdAndUpdate(
      { _id: user_id },
      { $set: updateData },
      { new: true },
    );
    return res.status(200).send({ success: true, userData: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const data = await UserModel.findById({ _id: user_id });
    if (data) {
      const url = data.image;
      await cloudinary.removeCloudinary(url);
      const urlData = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        { $set: { image: undefined } },
        { new: true },
      );
      return res.status(200).send({ success: true, userData: urlData });
    } else {
      res.status(400).send({ success: false, msg: error.message });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const _id = req.params._id;
    const data = await UserModel.findByIdAndUpdate(
      _id,
      {
        $set: { ...req.body, isOnboardingCompleted: true },
      },
      { new: true },
    );

    return res.status(200).send({ success: true, userData: data });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
    next();
  }
};

//add user admin
const add_user_for_admin = async (req, res) => {
  const user_id = req.user._id;
  const user = await UserModel.findById(user_id);
  if (!user) {
    return res.status(400).send({ success: false, msg: "Dont have this user" });
  }
  if (user.role != "admin") {
    return res
      .status(400)
      .send({ success: false, msg: "Dont have permission" });
  }
  const email = req.body.email;
  const userData = await UserModel.findOne({ email: email });
  const spassword = await securePassword(req.body.password);

  try {
    if (userData) {
      res.status(400).send({ success: false, msg: "Email đã được sử dụng" });
    } else {
      const user = new UserModel({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        image: req.body.image,
        role: req.body.role,
        password: spassword,
        is_verified: 1,
      });

      const registeredUser = await user.save();

      if (registeredUser) {
        const token = await createToken(registeredUser._id, email);
        const subscriberId = registeredUser._id;

        await novu.subscribers.identify(subscriberId, {
          email: registeredUser.email,
          firstName: registeredUser.first_name,
          lastName: registeredUser.last_name,
        });

        const data = { ...registeredUser, token };

        return res.status(200).send({
          success: true,
          data,
          msg: "Thêm người dùng thành công!",
        });
      } else {
        return res
          .status(500)
          .send({ success: false, msg: "Thêm người dùng thất bại!" });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: "Lỗi server!" });
  }
};
const update_user_admin = async (req, res) => {
  const admin_id = req.user._id;
  const admin = await UserModel.findById(admin_id);
  if (!admin) {
    return res.status(400).send({ success: false, msg: "Dont have this user" });
  }
  if (admin.role != "admin") {
    return res
      .status(400)
      .send({ success: false, msg: "Dont have permission" });
  }
  const email = req.body.email;
  const user_id = req.params.user_id;
  const userData = await UserModel.findOne({ email: email });
  const spassword = await securePassword(req.body.password);

  try {
    if (userData) {
      res.status(400).send({ success: false, msg: "Email đã được sử dụng" });
    } else {
      const registeredUser = await UserModel.findByIdAndUpdate(
        {
          _id: user_id,
        },
        {
          $set: {
            email: email,
            password: spassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            image: req.body.image,
            mobile: req.body.mobile,
            role: req.body.role,
          },
        },
        { new: true },
      );
      if (!registeredUser) {
        return res.status(400).send({
          success: false,
          msg: "Fail",
        });
      }
      res.status(200).send({
        success: true,
        msg: "Success",
        data: registeredUser,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Lỗi server!" });
  }
};
const delete_user_admin = async (req, res) => {
  const admin_id = req.user._id;
  const admin = await UserModel.findById(admin_id);
  if (!admin) {
    return res.status(400).send({ success: false, msg: "Dont have this user" });
  }
  if (admin.role != "admin") {
    return res
      .status(400)
      .send({ success: false, msg: "Dont have permission" });
  }
  const user_id = req.params.user_id;
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, msg: "Dont have this user" });
    }
    const deletedUser = await UserModel.findByIdAndDelete(user_id);
    if (!deletedUser) {
      return res.status(400).send({ success: false, msg: "Fail" });
    }
    res.status(200).send({ success: true, msg: "Success" });
  } catch (error) {
    return res.status(500).json({ error: "Lỗi server!" });
  }
};
//đăng nhập admin
const admin_login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await UserModel.findOne({ email: email });

    if (userData) {
      const password_Login = await bcrypt.compare(password, userData.password);

      if (password_Login) {
        if (userData.is_verified === 0) {
          res
            .status(400)
            .send({ success: false, msg: "Tài Khoản chưa được xác thực" });
        } else {
          if (userData.role === "admin") {
            const tokenData = await createToken(userData._id, email);
            const refreshTokenData = await createRefreshToken(
              userData._id,
              email,
            );

            const userResult = {
              _id: userData._id,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              image: userData.image,
              mobile: userData.mobile,
              token: tokenData,
              refreshToken: refreshTokenData,
              isOnboardingCompleted: userData.isOnboardingCompleted,
            };
            const response = {
              success: true,
              message: "Đăng nhập thành công",
              data: userResult,
            };
            res.status(200).send(response);
          } else {
            return res.status(400).send({
              success: false,
              msg: "Dont have permision",
            });
          }
        }
      } else {
        res.status(200).send({
          success: false,
          msg: "Tài khoản hoặc mật khẩu không chính xác!",
        });
      }
    } else {
      res.status(200).send({
        success: false,
        msg: "Tài khoản hoặc mật khẩu không chính xác!",
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};
module.exports = {
  getList,
  register_user,
  userLogin,
  userLogout,
  refreshToken,
  forget_password,
  update_password,
  reset_password,
  contact,
  verifyMail,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  checkCurrentUser,
  getCurrentUser,
  authGoogle,
  authGitHub,
  completeOnboarding,
  add_user_for_admin,
  update_user_admin,
  delete_user_admin,
  admin_login,
};
