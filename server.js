require("module-alias/register"); //註冊路徑別名
const Express = require("express");
const Http = require("http");
const Socket = require("socket.io");
const uuid = require("uuid");
const events = require("./event.js");
const startServer = async () => {
  const app = Express();
  const virtualDirPath = process.env.virtualDirPath || "";
  app.use(virtualDirPath, Express.static(__dirname + "/public")); //使用靜態資料夾

  const server = Http.createServer(app);
  const io = Socket(server);
  const users = {
    general: {},
  };
  const onConnection = (socket) => {
    // Listening for joining a room (joinRoom event)
    socket.on("joinRoom", events.joinRoom(socket));
    socket.on("disconnect", events.leaveRoom(socket));
    socket.on("updateInfo", events.updateInfo(socket));

    /*// for peer to peer communicate
    socket.on("offer", (offer) => events.offer( socket)({ room: "general", offer }));
    socket.on("answer", (answer) => events.answer( socket)({ room: "general", answer }));
    socket.on("icecandidate", (candidate) => events.icecandidate( socket)({ room: "general", candidate }));*/
  };
  io.on("connection", onConnection);
  const usersInfoBroadcast = events.usersInfoBroadcast(io);
  setInterval(() => {
    usersInfoBroadcast();
  }, 1000 / 60);

  const port = process.env.PORT || 4300;
  const host = process.env.BASE_URL || "localhost";
  const baseUrl = `http://${host}:${port}`;
  server.listen(port, () => {
    console.log(`${baseUrl}`);
  });
};
startServer();
