const mongoose = require("mongoose");

const TransactionHistory = new mongoose.Schema({


    PositionGroup: {
		type: String,
		required: true,
	},
    from: {
		type: String,
		required: true,
	},
    to: {
		type: String,
		required: true,
	},
    LeagueName:{
        type:String,
        required:true
    }


})


module.exports = mongoose.model("TransactionHistory", TransactionHistory);

