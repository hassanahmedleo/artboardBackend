const mongoose = require("mongoose");

const RecentPicks = new mongoose.Schema({
    LeagueName: {
        type: String,
        required: true,
    },
    Players: {
        type: Array,
        required: true
    }, 
}
)

module.exports = mongoose.model("RecentPicks", RecentPicks);