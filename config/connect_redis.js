const redis = require("redis");
const bluebird = require("bluebird");

// Promisify Redis client
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
// Tạo một client Redis
const client = redis.createClient();

// Kết nối tới Redis server
client.on("connect", function () {
  console.log("Connected Redis...");
});

// Kiểm tra Redis server ready chưa
client.on("ready", function () {
  console.log("Redis is Ready");
});

// Lỗi kết nối
client.on("error", function (err) {
  console.log("Lỗi " + err);
});

// client.quit();
module.exports = client;
