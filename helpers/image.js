const fs = require("fs");

const getBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const base64String = Buffer.from(data).toString("base64");
        resolve(base64String);
      }
    });
  });
};

module.exports = getBase64;
