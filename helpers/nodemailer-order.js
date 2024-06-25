const nodemailer = require("nodemailer");

let mail = (email, price) => {
  var transporter = nodemailer.createTransport({
    // config mail server
    service: "Gmail",
    auth: {
      user: `18520878@gm.uit.edu.vn`,
      pass: `azeszsmbvatldpsw`,
    },
  });
  var mainOptions = {
    // thiết lập đối tượng, nội dung gửi mail
    from: `18520878@gm.uit.edu.vn`,
    to: `${email}`,
    subject: `Đặt Hàng Thành Công`,
    html: `<p>Bạn đặt thành công đơn hàng tại KHAI SPACE. Đơn Hàng có tổng giá là ${price} </p>`,
  };
  transporter.sendMail(mainOptions, async function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};

module.exports = {
  mail,
};
