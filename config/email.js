module.exports = {
  smtp: {
    protocal: "",
    email: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    server: process.env.HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    security: "",
  },
  channel: process.env.SERVICE, // ['smtp','mailgun','sendgrid']
  mailgun: {
    api_key: "",
    domain: "",
  },
  sendgrid: {
    api_key: process.env.SENDGRID_API_KEY,
  },
};
