const mongoose = require("mongoose");

const League = new mongoose.Schema({


 LeagueName: {

		type: String,
		required: true,
        unique: true
  },

 Numberofteams: {

      type:Number,
      required:true
  },
  managerid: {
    type:String,
    required:true
},

currentweek:{
    type:Number,
    required:true
},
Winners:{
    type:Array,
    required:true
},
RecentScores:{
    type:Array,
    required:true
},
MatchupsScore:{
    type:Array,
    required:true
},
Losers:{
    type:Array,
    required:true
},
DraftAssist:{
    type:Array,
    required:true
},
DraftPlayers:{
    type:Array,
    required:true
}

})

module.exports = mongoose.model("League", League);