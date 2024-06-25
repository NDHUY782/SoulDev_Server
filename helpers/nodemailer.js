const nodemailer = require("nodemailer");

const ContactModel = require(`${__path_models}contact_model`);

let mail = (dataSetting, email, id) => {
  let cc = "";
  JSON.parse(dataSetting.cc).forEach((item) => {
    cc += item.value + ",";
  });

  let from = "";
  JSON.parse(dataSetting.from).forEach((item) => {
    from += item.value + ",";
  });

  from = from.substring(0, from.length - 1);
  cc = cc.substring(0, cc.length - 1);

  var transporter = nodemailer.createTransport({
    // config mail server
    service: "Gmail",
    auth: {
      user: `${from}`,
      pass: `${dataSetting.pass}`,
    },
  });
  var mainOptions = {
    // thiết lập đối tượng, nội dung gửi mail
    from: `${from}`,
    to: `${email}`,
    cc: `${cc}`,
    subject: `${dataSetting.subject}`,
    html: `${dataSetting.contentEmail}`,
  };
  transporter.sendMail(mainOptions, async function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Message sent: " + info.response);
      let data = {
        email: email,
        status: "active",
      };
      await ContactModel.updateOne({ _id: id }, data);
    }
  });
};

module.exports = {
  mail,
};
