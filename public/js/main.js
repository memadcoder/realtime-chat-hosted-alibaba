const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const socket = io();

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//listening to loadChat event emitted by server to load existing chat history
socket.on("loadChats", (data) => {
  outputInbox(data);
});

//join chat room with username
socket.emit("joinRoom", { username, room });

//total list of users in the room form server
socket.on("getRoomUser", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on("message", (message) => {
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get message text from form
  const msg = e.target.elements.msg.value;

  //emitting message to the server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//loading chat histroy
function outputInbox(data) {
  length = data.length;

  for (let j = 0; j < length; j++) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${data[j].userName} <span>${data[j].time}</span></p>
        <p class="text">
         ${data[j].message}
        </p>`;
    document.querySelector(".chat-messages").appendChild(div);
  }
}

//output Message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
     ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//add room to the DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//add users to the DOM
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")} 
  `;
}
