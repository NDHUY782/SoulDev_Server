require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection success!");
  } catch (err) {
    console.log("MongoDB connection failed!", err.message);
  }
};

module.exports = {
  connectDB,
};
