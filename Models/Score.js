const mongoose = require("mongoose");

const Score = new mongoose.Schema({

    LeagueName:{

        type:String,
        required:true,
        unique:true

    },

    ScoreForTrading: {

      type:Array,
      required:true
  },
 }
)

module.exports = mongoose.model("Score", Score);