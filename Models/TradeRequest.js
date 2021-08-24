const mongoose = require("mongoose");

const TradeRequest = new mongoose.Schema({


    LeagueName: {
		type: String,
		required: true,
    },

    Useridfrom: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    Useridto: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    Teamnamefrom: {
        type: String,
        required: true,
    },

    Teamnameto: {
        type: String,
        required: true,
    },

    PositionGroup: {
        type: String,
        required: true,
    },

    UserVerification: {
        type: Boolean,
        required: true,
    },
    
Score:{
    type:String,
    required: true,

}

 }
)

module.exports = mongoose.model("TradeRequest", TradeRequest);