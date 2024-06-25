const jwt = require("jsonwebtoken");
const client = require("../config/connect_redis");
const createToken = async (id, email) => {
  try {
    const token = await jwt.sign({ _id: id, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    res.status(400).send(error.message);
  }
};
// const createRefreshToken = async (id, email) => {
//   try {
//     const refresh_token = await jwt.sign(
//       { _id: id, email },
//       process.env.JWT_SECRET_REFRESH_TOKEN,
//       {
//         expiresIn: "730d",
//       },
//     );
//     return refresh_token;
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// };
// const createRefreshToken = async (id, email) => {
//   return new Promise((resolve, reject) => {
//     jwt.sign(
//       { _id: id, email },
//       process.env.JWT_SECRET_REFRESH_TOKEN,
//       {
//         expiresIn: "730d",
//       },
//       (err, token) => {
//         if (err) reject(err);
//         client.set(
//           id.toString(),
//           token,
//           "EX",
//           365 * 24 * 60 * 60,
//           (err, reply) => {
//             if (err) {
//               return res.status(400).send(error.message);
//             }
//           },
//         );
//         resolve(token);
//       },
//     );
//   });
// };
const createRefreshToken = async (id, email) => {
  try {
    const refresh_token = await jwt.sign(
      { _id: id, email },
      process.env.JWT_SECRET_REFRESH_TOKEN,
      { expiresIn: "730d" },
    );

    await client.set(id.toString(), refresh_token, "EX", 365 * 24 * 60 * 60);

    return refresh_token;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const authToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return;
  }

  try {
    const descode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = descode;
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid Token");
  }
  return next();
};

module.exports = {
  createToken,
  createRefreshToken,
  authToken,
};
