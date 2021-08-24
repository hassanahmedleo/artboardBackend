const mongoose = require("mongoose");

const   Schedule = new mongoose.Schema({

    LeagueName:{

        type:String,
        required:true,
        unique:true

    },

    Schedule: {
      type:Array,
      required:true
  },
 }
)

module.exports = mongoose.model("Schedule", Schedule);