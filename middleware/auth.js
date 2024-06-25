const { rejects } = require("assert");
const jwt = require("jsonwebtoken");
const { resolve } = require("path");
const client = require("../config/connect_redis");

const auth = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({ message: "No auth token, access denied" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      if (verified.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Token verification failed, authorization denied.",
        });
      }
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied." });
    }

    req.user = verified;
    req.token = token;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: err.message });
  }
};
// const authRefreshToken = async (refreshToken) => {
//   // return new Promise((resolve,rejects)=>{
//   //   jwt.verify(
//   //     refreshToken,
//   //     process.env.JWT_SECRET_REFRESH_TOKEN,(err,payload) => {
//   //       if (err) {
//   //         return rejects(err)
//   //       }
//   //       resolve(payload)
//   //     }
//   //   );
//   // })
//   try {
//     const payload = await new Promise((resolve, reject) => {
//       jwt.verify(
//         refreshToken,
//         process.env.JWT_SECRET_REFRESH_TOKEN,
//         (err, decoded) => {
//           if (err) {
//             return reject(err);
//           }
//           client.get(decoded._id, (err, reply) => {
//             if (err) {
//               return reject(err);
//             }
//             if (refreshToken === reply) {
//               return resolve(decoded);
//             }
//             return reject(err);
//           });
//         },
//       );
//     });
//     return payload;
//   } catch (err) {
//     throw err;
//   }
// };
const authRefreshToken = async (refreshToken) => {
  // return new Promise((resolve,rejects)=>{
  //   jwt.verify(
  //     refreshToken,
  //     process.env.JWT_SECRET_REFRESH_TOKEN,(err,payload) => {
  //       if (err) {
  //         return rejects(err)
  //       }
  //       resolve(payload)
  //     }
  //   );
  // })
  try {
    const payload = await new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_REFRESH_TOKEN,
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          client.get(decoded._id, (err, reply) => {
            if (err) {
              return reject(err);
            }
            if (refreshToken === reply) {
              return resolve(decoded);
            }
            return reject(err);
          });
        },
      );
    });
    return payload;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  auth,
  authRefreshToken,
};
