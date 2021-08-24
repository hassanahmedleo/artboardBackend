const mongoose = require("mongoose");

const Players = new mongoose.Schema({
 Teams: {

      type:Array,
      required:true
  },
 }
)

module.exports = mongoose.model("Players", Players);