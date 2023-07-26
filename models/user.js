const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 20 },
  password: { type: String, required: true, maxLength: 70 },
  member: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
