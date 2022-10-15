const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdersSchema = new Schema({
	accId:{
        type: Object,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    type: {
        type: Number,
        require: true
    },
    result: {
        type: Number,
        default: 0
    },
    profit: {
        type: Number,
        default: 0
    },
	created: {
		type: Date,
		default: Date.now,
	},
});

const Order = mongoose.model("Order", OrdersSchema);

module.exports = Order;
