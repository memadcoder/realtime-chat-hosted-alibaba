const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const config = require("config");
const formatMessages = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
  loadChat,
} = require("./utils/users");
const mongoose = require("mongoose");

const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//set static folder
app.use(express.static(path.join(__dirname, "public")));
const botName = "Chat Bot";
//run when client connects

io.on("connection", (socket) => {
  const db = config.get("mongoURI");
  //connection to the mongoose
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("sucessfully connected to mongodb atlas server in cloud....");
    })
    .catch((err) => {
      console.log(err);
    });

  //checking connection status to mongodb
  var dbs = mongoose.connection;
  dbs.on("error", (err) => {
    console.log(err);
  });
  dbs.once("open", () => {
    console.log("connected to mongodb");
  });

  // messages = await loadChat();
  // console.log("type of messages", typeof messages);
  // console.log(messages);
  //

  //listening to joinRoom event from client
  socket.on("joinRoom", async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //emitting event to load previous chat
    //console.log(user.room);
    socket.emit("loadChats", await loadChat());

    //welcome current user
    // socket.emit(
    //   "message",
    //   formatMessages(botName, `Welcome To The ChatRoom...`)
    // );

    //boradcast when a user connects;
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessages(botName, `${user.username} has joined to the chat`)
      );

    //list all current users in the group
    io.to(user.room).emit("getRoomUser", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    //console.log(user.room, user.username);
    // io.to(user.room).emit("message", formatMessages(user.username, msg));
    io.to(user.room).emit("message", formatMessages(user.username, msg));
  });

  //runs when client disconnects;
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessages(botName, `${user.username} Left The Chat`)
      );

      //list all current users in the group
      io.to(user.room).emit("getRoomUser", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const port = process.env.PORT || 3000;

//calling api

server.listen(port, () => console.log(`server is listening at port ${port}`));
