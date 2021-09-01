const mongoose = require("mongoose");

const Teams = new mongoose.Schema({

UserID:{
    type: mongoose.Schema.Types.ObjectId,
    required:true
},

LeagueName: {
		type: String,
		required: true,
  },

 Players : {
      type: Array,
      required:true
  },
  
 TeamName: {
      type:String,
      required:true,
      unique:false
 },

  Transactionsinthisweek: {
    type:Number,
    required:true,
},

 }
)

module.exports = mongoose.model("Teams", Teams);