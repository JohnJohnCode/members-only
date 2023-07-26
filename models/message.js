const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxLength: 300 },
  timestamp: { type: Date, required: true },
});

// Virtual for message date with correct format.
MessageSchema.virtual("date").get(function () {
  var date = DateTime.fromJSDate(this.timestamp).toLocaleString({
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
  date =
    date +
    " " +
    DateTime.fromJSDate(this.timestamp).toLocaleString({
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  return date;
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);
