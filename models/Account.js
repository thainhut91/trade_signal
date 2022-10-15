const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSignalSchema = new Schema({
	username:{
        type: String,
        require: true
    },
    teleId: {
        type: String,
        require: true
    },
    actived: {
        type: Number,
        default: 0
    },
    startSignal: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: 'user'
    },
	created: {
		type: Date,
		default: Date.now,
	},
});

const AccountSignal = mongoose.model("AccountSignal", AccountSignalSchema);

module.exports = AccountSignal;
