const mongoose = require("mongoose");

const User = new mongoose.Schema({
	FirstName: {

		type: String,
		required: true,
	},
	LastName: {

		type: String,
		required: true,
	},
	UserName: {
		type: String,
		required: true,
	},
	Email: {

		type: String,
		required: true,

	},
    Password: {

		type: String,
		required: true,

	},
	Leaguename: {

		type: String,
		ref: "League"
		//required: true,

	},
	Teamname:{
		type: String,
	},
	
	isVerified: {

		type: Boolean,
		required:true,
	},
	image:{
		type:Object,
	}
	
});

module.exports = mongoose.model("User", User);
