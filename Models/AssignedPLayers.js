const mongoose = require("mongoose");

const AssignedPlayers = new mongoose.Schema({


 LeagueName: {

       type: String,
	required: true,
  },

 Playerid: {
        type:String,
        required:true
 },
 Userid: {
       type:String,
       required:true

},

Playerposition: {
       type:String,
       required:true
},
TeamName: {
       type:String,
       required:true
},
 }
)

module.exports = mongoose.model("AssignedPlayers", AssignedPlayers);