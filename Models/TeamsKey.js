const mongoose = require("mongoose");

const Key = new mongoose.Schema({
    key: {
		type: String,
		required: true,
  }
 }
)

module.exports = mongoose.model("Key", Key);