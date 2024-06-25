const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const emailValidator = require("deep-email-validator");
const EmailValidation = require("email-validator");
const sgMail = require("@sendgrid/mail");
//import env
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//send email using sendgrid
const sendEmailSendGrid = (email, otp, message, res) => {
  const msg = {
    to: email, // Change to your recipient
    from: "noreply@vgcgolf.com", // Change to your verified sender
    subject: "Mã xác nhận Email",
    html: `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2; background-color: #ffffff">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #000">
    <img src="https://vgcgolf.com/wp-content/uploads/elementor/thumbs/image-23-2-1-q9j45uxyk86xjl0qqqjqwmh5pq3adq1dgnm5u8xmgw.png" title="image-23-2" alt="image-23-2" loading="lazy">
    </div>
    <p style="font-size:1.1em">Mã xác thực tài khoản của bạn là:</p>
    <h2 style="background:rgb(251, 141, 47);margin: 30px auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-weight: bold">  Sử dụng OTP để hoàn tất thủ tục đăng ký. OTP sẽ có hiệu lực trong vòng 60 giây.</p>
    <p style="font-size:0.9em;">Chúc bạn vui vẻ với VGC!</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Vietnam Golf Community CO.,JSC</p>
      <p>VietNam</p>
    </div>
  </div>
</div>
    `,
  };
  sgMail
    .send(msg)
    .then(() => {
      //   res.send({
      //     message: message,
      //   });
      console.log(message);
    })
    .catch((error) => {
      //   res.send({
      //     message: `Error happened when sending email ${error.message}`,
      //   });
      console.log(error.message);
    });
};

const validateEmail = async (email) => {
  //user email validation npm email-validator
  const valid = EmailValidation.validate(email);
  if (!valid) {
    return false;
  }
  return true;
};

const sendEmail = (email, otp, message, res) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASS, // generated ethereal password
    },
  });

  //   transporter.verify(function (err, success) {
  //     if (err) {
  //       res.status(403).send({
  //         message: `Error happened when verifying ${err.message}`,
  //       });
  //       console.log(err.message);
  //     } else {
  //       console.log("Server is ready to take our messages");
  //     }
  //   });

  const mailOptions = {
    from: "golffriend", // sender address
    to: email, // list of receivers
    subject: "OTP", // Subject line
    text: `Your OTP is ${otp}`, // plain text body
    html: `<b>Your OTP is ${otp}</b>`, // html body
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      //   res.send({
      //     message: `Error happened when sending email ${err.message}`,
      //   });
      console.log(err.message);
    } else {
      //   res.send({
      //     message: message,
      //   });
      console.log(message);
    }
  });
};

// The rate limit configurations remain the same

module.exports = {
  sendEmail,
  validateEmail,
  sendEmailSendGrid,
};
