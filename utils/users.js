const model = require("./model");

const users = [];

//join user to chat
function userJoin(id, username, room) {
  user = { id, username, room };

  //to temporary array
  users.push(user);

  //inserting user to the persistance database
  model
    .find()
    .distinct("users")
    .then((data) => {
      const duplicateFlag = data.filter((user) => user.userName === username);
      if (duplicateFlag.length != 0) {
        console.log("Old user");
        //res.status(400).json({ msg: "User Already Exists" });
      } else {
        //to send to database
        const userPayload = { userName: username };

        model
          .updateMany(
            {},
            {
              $push: {
                users: userPayload,
              },
            },
            { multi: true }
          )
          .then((result) => {
            //res.status(200).json({ msg: "New User Added" });
            console.log("New user added");
          })
          .catch((err) => {
            //res.status(400).json({ msg: err });
            return err;
          });
      }
    }).catch(err=>{
      console.log("not found");
    })

  return user;
}

//get current user
function getCurrentUser(id) {
  return users.find((user) => user.id == id);
}

//user leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

//get all chatInbox
function loadChat() {
  return model
    .find()
    .distinct("messages")
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  loadChat,
};
