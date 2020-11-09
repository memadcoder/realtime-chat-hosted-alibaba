const moment = require("moment");
const model = require("./model");

function formatMessage(username, text) {
  const userName = username;
  const message = text;
  const time = moment().format("h:mm a");

  if (userName === "Chat Bot") {
    return {
      username,
      text,
      time,
    };
  } else {
    const messages = {
      time,
      message,
      userName,
    };

    model
      .updateMany(
        {},
        {
          $push: {
            messages,
          },
        },
        { multi: true }
      )
      .then((result) => {
        //res.status(200).json({ msg: "Success Update" });
        console.log("Inbox Updated");
      })
      .catch((err) => {
        //res.status(400).json({ msg: err });
        console.log(err);
      });

    return {
      username,
      text,
      time,
    };
  }
}

module.exports = formatMessage;
