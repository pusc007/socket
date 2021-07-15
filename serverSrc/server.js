const Http = require("http");
const Socket = require("socket.io");
//const p2pserver = require("socket.io-p2p-server").Server;
const nStatic = require("node-static");

const events = require("./event.js");
const { setImmediate } = require("timers");

const startServer = async () => {
  const fileServer = new nStatic.Server("./public");
  const server = Http.createServer((req, res) => {
    fileServer.serve(req, res);
  });
  const io = Socket(server, {
    cors: {
      origin: "*",
    },
  });

  //io.use(p2pserver);
  const onConnection = (socket) => {
    events.init(socket)();
    socket.on("disconnect", events.leave(socket));
    socket.on("input", events.input(socket));
  };
  io.on("connection", onConnection);
  /*setInterval(() => {
    events.update(io)();
  }, 1000 / 30);*/

  let lastTime = Date.now();
  let delta = 0;
  const run = () => {
    const currTime = Date.now();
    delta += currTime - lastTime;
    if (delta >= 16) {
      if (delta <= 83) {
        events.update(io)(delta);
      } else {
        console.log("超過回饋時間");
      }
      delta = 0;
    }
    lastTime = currTime;
    setImmediate(run);
  };
  run();

  const port = process.env.PORT || 4300;
  const host = process.env.BASE_URL || "localhost";
  const baseUrl = `http://${host}:${port}`;
  server.listen(port, () => {
    console.log(`${baseUrl}`);
  });
};
startServer();
