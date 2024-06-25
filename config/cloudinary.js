const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const options = {
  use_filename: true,
  unique_filename: false,
  overwrite: true,
  folder: process.env.FOLDER_NAME,
};

let uploadFileCloudinary = (imageBase64, fileName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageBase64,
      { ...options, public_id: fileName },
      (error, result) => {
        if (result) {
          return resolve(result.secure_url);
        }

        console.log(error);
        reject(error);
      },
    );
  });
};

let removeFileCloudinary = (imageUrl) => {
  return new Promise(async (resolve, reject) => {
    //* detach and get publicId in url of image
    const publicId = imageUrl.split("/").pop().split(".")[0];
    //* cat full publicId of image
    const fullPublicId = `${options.folder}/${publicId}`;
    //* destroy image in cloud strore
    try {
      const result = await cloudinary.uploader.destroy(fullPublicId);
      return resolve(result);
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  uploadCloudinary: uploadFileCloudinary,
  removeCloudinary: removeFileCloudinary,
};
