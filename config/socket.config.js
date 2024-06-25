const server = require("../api/index");
const { Server } = require("socket.io");

const io = new Server(server);

// let arrUserInrouter = {};

io.on("connection", (socket) => {
  console.log("a user connect with id", socket.id);
  // socket.on("disconnect", () => {
  //   for (const router in arrUserInrouter) {
  //     var index = arrUserInrouter[router].indexOf(socket.id);
  //     if (index !== -1) {
  //       arrUserInrouter[router].splice(index, 1);
  //     }
  //   }
  //   // if (arrUserInrouter['blog']) {
  //   //     console.log('viewBlog',arrUserInrouter['blog'].Length)
  //   // }
  //   //   console.log('user disconnected id : ',socket.id);
  // });
  // socket.on("router_user", (router) => {
  //   if (!arrUserInrouter[router]) {
  //     arrUserInrouter[router] = [];
  //   }
  //   arrUserInrouter[router].push(socket.id);

  //   if (arrUserInrouter["blog"]) {
  //     // console.log('viewBlog',arrUserInrouter['blog'].length)
  //   }
  //   if (arrUserInrouter["home"]) {
  //     // console.log('viewHome',arrUserInrouter['home'].length)
  //   }

  //   // const viewBLog = arrUserInrouter['blog'].length
  //   //     console.log('view',viewBLog)
  // });
});

module.exports = io;
