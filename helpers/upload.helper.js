const httpStatus = require("http-status");
const otherHelper = require("./other.helper");
const multer = require("multer");
const fs = require("fs");
const { uploadFile, getFileStream, uploadFileBuffer } = require("./s3.helper");

const maxFileSize = process.env.maxFileSize || 1000000000;
const uploaderHelper = {};

const mimeType = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/heic": "heic",
  "image/svg": "svg",
  "image/svg+xml": "svg+xml",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/mpeg": "mpeg",
  "video/quicktime": "MOV",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

uploaderHelper.uploadFiles = (destinationPath, uploadType, fieldData) => {
  const temp = maxFileSize / (1024 * 1024);

  var storage = multer.memoryStorage();

  const uploader = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
      const isValid = !!mimeType[file.mimetype]; // Check if the valid mime type is submitted
      const error = isValid
        ? null
        : new Error("Only images and video files allowed!");
      callback(error, isValid);
    },
    limits: { fileSize: maxFileSize },
  });

  let upload;

  if (uploadType === "array") {
    upload = uploader.array(fieldData);
    // upload = uploader.array(fieldData);
  } else if (uploadType === "fields") {
    upload = uploader.fields(fieldData);
  } else if (uploadType === "single") {
    upload = uploader.single(fieldData);
  } else if (uploadType === "any") {
    upload = uploader.any(fieldData);
  }

  return (fileUpload = (req, res, next) => {
    upload(req, res, async function (error) {
      console.log("fileUpllad", error);
      if (error) {
        if (error.code == "LIMIT_FILE_SIZE") {
          return otherHelper.sendResponse(
            res,
            httpStatus.NOT_ACCEPTABLE,
            false,
            error,
            null,
            `FileSize must be greater than ${temp}MB`,
            null,
          );
        } else {
          return otherHelper.sendResponse(
            res,
            httpStatus.NOT_ACCEPTABLE,
            false,
            error,
            null,
            `${error}`,
            null,
          );
        }
      } else {
        console.log("uploader", req.file, req.files);

        if (req.files || req.file) {
          if (uploadType === "single") {
            const randomString = await otherHelper.generateRandomHexString(15);
            //check if original name exists
            if (!req.file.originalname) {
              req.file.originalname =
                randomString + "." + mimeType[req.file.mimetype];
            }
            if (!req.file.originalname.includes(".")) {
              req.file.originalname += "." + mimeType[req.file.mimetype];
            }
            req.file.filename = randomString + "-" + req.file.originalname;
            await uploadFileBuffer(req.file);
            req.file.path = `https://golffriends-prod.s3.ap-southeast-1.amazonaws.com/${req.file.filename}`;
            if (req.file?.buffer) {
              delete req.file.buffer;
            }
          } else if (uploadType === "array") {
            const avatars = req.files;
            if (avatars && avatars.length > 0) {
              const uploadPromises = avatars.map(async (file) => {
                //check if original name exists
                if (!file.originalname) {
                  file.originalname =
                    randomString + "." + mimeType[file.mimetype];
                }
                if (!file.originalname.includes(".")) {
                  file.originalname += "." + mimeType[file.mimetype];
                }
                const randomString =
                  await otherHelper.generateRandomHexString(15);
                file.filename = randomString + "-" + file.originalname;
                const resp = await uploadFileBuffer(file);
                console.log("resp", resp);
                file.path = `https://golffriends-prod.s3.ap-southeast-1.amazonaws.com/${file.filename}`;
                if (file?.buffer) {
                  delete file.buffer;
                }
              });
              await Promise.all(uploadPromises);
            }
          } else if (uploadType === "any") {
            const avatars = req.files;
            if (avatars && avatars.length > 0) {
              const uploadPromises = avatars.map(async (file) => {
                const randomString =
                  await otherHelper.generateRandomHexString(15);
                //check if original name exists
                if (!file.originalname) {
                  file.originalname =
                    randomString + "." + mimeType[file.mimetype];
                }
                if (!file.originalname.includes(".")) {
                  file.originalname += "." + mimeType[file.mimetype];
                }
                file.filename = randomString + "-" + file.originalname;
                const resp = await uploadFileBuffer(file);
                console.log("resp", resp);
                file.path = `https://golffriends-prod.s3.ap-southeast-1.amazonaws.com/${file.filename}`;
                if (file?.buffer) {
                  delete file.buffer;
                }
              });
              await Promise.all(uploadPromises);
            }
          }

          next();
        } else {
          next();
        }
      }
    });
  });
};

module.exports = uploaderHelper;
