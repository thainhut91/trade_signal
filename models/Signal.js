const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SignalSchema = new Schema({
	signal: {
        type: String,
        require: true,
    },
    signalConvert: {
        type: String,
        require: true,
    },
    orderOfSignal: {
        type: Number,
        require: true,
    },
    signalLength: {
        type: Number,
        require: true,
    },
    active: {
        type: Number,
        default: 0
    },
	created: {
		type: Date,
		default: Date.now,
	},
});

const Signal = mongoose.model("Signal", SignalSchema);

module.exports = Signal;
