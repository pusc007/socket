//const users = {};
const rooms = {
  general: {},
  A: {},
  B: {},
};
const getUsersRoom = (room) => {
  const usersRoom = {};
  for (let key in users) {
    if (users[key].room === room) usersRoom[key] = users[key];
  }
  return usersRoom;
};
const getUserRoom = (id) => {
  for (let room in rooms) {
    for (let key in rooms[room]) {
      if (rooms[room][key].id === id) return room;
    }
  }
};
const joinRoom =
  (socket) =>
  ({ username, room }) => {
    /*if (users[socket.client.id]) {
      const oldRoom = users[socket.client.id].room;
      users[socket.client.id].room = room;
      socket.leave(oldRoom);
      socket.server.to(oldRoom).emit("userLeave", getUsersRoom(oldRoom));
      socket.join(room);
    } else {
      const obj = { username: username, id: socket.client.id, room: room };
      users[socket.client.id] = obj;
      socket.join(room);
    }
    socket.server.to(room).emit("newUser", getUsersRoom(room));*/
    const oldRoom = getUserRoom(socket.client.id);
    if (oldRoom) {
      const user = rooms[oldRoom][socket.client.id];
      delete rooms[oldRoom][socket.client.id];
      rooms[room][socket.client.id] = user;
      socket.leave(oldRoom);
      socket.server.to(oldRoom).emit("userLeave", rooms[oldRoom]);
      socket.join(room);
    } else {
      const obj = { username: username, id: socket.client.id, pos: [0, 0] };
      rooms[room][socket.client.id] = obj;
      socket.join(room);
    }
    socket.server.to(room).emit("newUser", rooms[room]);
  };

const leaveRoom =
  (socket) =>
  ({}) => {
    /*const user = users[socket.client.id];
    if (!user) return;
    delete users[socket.client.id];
    const room = user.room;
    socket.leave(room);
    socket.server.to(room).emit("userLeave", getUsersRoom(room));*/

    const room = getUserRoom(socket.client.id);
    if (!room) return;
    delete rooms[room][socket.client.id];
    socket.leave(room);
    socket.server.to(room).emit("userLeave", rooms[room]);
  };
const usersInfoBroadcast = (io) => () => {
  for (let room in rooms) {
    io.sockets.to(room).emit("usersInfo", rooms[room]);
  }
};

const updateInfo =
  (socket) =>
  ({ pos }) => {
    const room = getUserRoom(socket.client.id);
    if (!room) return;
    rooms[room][socket.client.id].pos = pos;
  };

module.exports = {
  joinRoom,
  leaveRoom,
  usersInfoBroadcast,
  updateInfo,
};
