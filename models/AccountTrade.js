const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
	username:{
        type: String,
        require: true
    },
    teleId: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: 'user'
    },
    liveAccount: {
        type: String,
    },
    livePass: {
        type: String,
    },
    liveUserToken: {
        type: String
    },
    liveAccToken: {
        type: String
    },
    timeLogin: {
        type: Date,
    },
    isTrade: {
        type: Number,
        default: 0
    },
    actived: {
        type: Number,
        default: 0
    },
	created: {
		type: Date,
		default: Date.now,
	},
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
