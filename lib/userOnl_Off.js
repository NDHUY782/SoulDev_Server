const isUserOnline = (user_id) => {
  return new Promise((resolve, reject) => {
    client.get(user_id, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result === "online");
      }
    });
  });
};
const setUserOnline = (user_id) => {
  return new Promise((resolve, reject) => {
    client.set(user_id, "online", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
const setUserOffline = (user_id) => {
  return new Promise((resolve, reject) => {
    client.del(user_id, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
module.exports = {
  isUserOnline,
  setUserOnline,
  setUserOffline,
};
