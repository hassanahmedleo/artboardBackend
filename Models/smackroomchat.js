const mongoose = require("mongoose");

const ChatRoom = new mongoose.Schema({
	message1: {
		type: String,
		required: true,
	},
	name1: {
		type: String,
		required: true,
	},
	date1: {
		type: Array,
		required: true,
	},
	userid: {
		type: String,
		required: true,
	}
	
});

module.exports = mongoose.model("ChatRoom", ChatRoom);
