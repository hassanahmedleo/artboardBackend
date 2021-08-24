const mongoose = require("mongoose");

const Players12 = new mongoose.Schema({


    Players: {

      type:Array,
      required:true
  },
 }
)

module.exports = mongoose.model("Players12", Players12);
