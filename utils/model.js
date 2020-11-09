const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  roomId: Number,
  roomName: {
    type: String,
    required: true,
    unique: true,
  },
  users: [{ userName: String }],
  messages: [{ time: String, message: String, userName: String }],
});

module.exports = roomModal = mongoose.model("roomModal", chatRoomSchema);
