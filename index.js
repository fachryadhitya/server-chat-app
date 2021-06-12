const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./helpers/users");

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

const allRooms = []

app.get('/allRooms', async(req, res, next) => {
  try {
    res.status(200).send(allRooms)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

io.on("connect", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    // allRooms.push({
    //   name: room
    // })

    // console.log(allRooms)

    socket.emit("message", {
      user: "admin", 
      text: `${user.name}, welcome to room ${user.room}.`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    console.log(io.sockets.adapter.rooms)

    

    callback();
    // console.log(socket.rooms)
  });

  // io.emit('roomData', (it) => {
  //   console.log(it)
  // })

  

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  }); 

  socket.on("broadcast", (message, callback) => {
    io.emit('message', {user: `Broadcast Message`, text: message})
    callback()

  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left the room.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      // allRooms.filter(item => item.name !== user.room)
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
