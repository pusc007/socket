const uuid = require("uuid");
const { Vector, VectorE } = require("../js/vector.js");

const players = {};
const bullets = {};
const room = "general";
let roomSocket;

const init = (socket) => () => {
  socket.join(room);
  socket.emit("init", { id: socket.client.id, players, bullets });
  roomSocket = socket.server.to(room);
  addPlayer(socket)();
};

const leave = (socket) => () => {
  delete players[socket.client.id];
  socket.leave(room);
  roomSocket.emit("leave", socket.client.id);
};

const addPlayer = (socket) => () => {
  players[socket.client.id] = {
    id: socket.client.id,
    pos: [Math.random() * 800, Math.random() * 600],
    targetPos: [0, 0],
    speed: 300,
    move: [0, 0],
  };
  roomSocket.emit("addPlayer", players[socket.client.id]);
};
const input = (socket) => (key, data) => {
  const player = players[socket.client.id];
  if (key == "move") {
    VectorE.set(player.move, data.x, data.y);
  } else if (key == "mousePos") {
    player.targetPos[0] = data.x;
    player.targetPos[1] = data.y;
  } else if (key == "fire") {
    const id = uuid.v4();
    bullets[id] = {
      playerID: player.id,
      id,
      pos: player.pos.slice(),
      angle: Vector.getAngle(Vector.normalize(Vector.sub(player.targetPos, player.pos))),
      speed: 1000,
      life: 0,
      lifeMax: 2,
    };
    roomSocket.emit("addBullet", bullets[id]);
  }
  //roomSocket.emit("update", { players, bullets });
};

const update = (io) => (deltaMS) => {
  const delta = deltaMS * 0.001;
  if (roomSocket) {
    for (let key in players) {
      const player = players[key];
      VectorE.add(player.pos, Vector.scale(Vector.normalize(player.move), player.speed * delta));
    }
    for (let key in bullets) {
      const bullet = bullets[key];
      VectorE.add(bullet.pos, Vector.scale(Vector.rotate([1, 0], bullet.angle), bullet.speed * delta));
      for (let playKey in players) {
        const player = players[playKey];
        if (bullet.playerID !== player.id) {
          const len = Vector.length(Vector.sub(bullet.pos, player.pos));
          if (len < 15) {
            roomSocket.emit("hit", { pos: bullet.pos });
            roomSocket.emit("removeBullet", key);
            delete bullets[key];
          }
        }
      }
      bullet.life += delta;
      if (bullet.life > bullet.lifeMax) {
        roomSocket.emit("removeBullet", key);
        delete bullets[key];
      }
    }
    roomSocket.emit("update", { players, bullets });
  }
};

module.exports = {
  init,
  leave,
  input,
  update,
};
