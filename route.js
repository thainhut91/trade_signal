"use strict";
const axios = require('axios');

var mongoose = require("mongoose"),
	Account = mongoose.model("AccountSignal"),
	Setting = mongoose.model('SettingTrade'),
	Order = mongoose.model('Order');

var { SendMsg } = require("./telegram/index.js");

var url_trade = process.env.URL_TRADE;

const CalProfit = function (amount) {
	return amount - amount * 0.05;
};

const ResultOrder =  async function(isWin){
	try {
		var orders = await Order.find({ result: 0 });
		if (orders.length == 0) return;

		orders.forEach(async (order) => {
			order.result = isWin == 1 ? 1 : -1;
			order.profit = isWin == 1 ? CalProfit(order.amount) : -order.amount;
			await order.save();

			Setting.findOne({ accId: order.accId }, async (err, setting) => {
				var amounts = setting.quanlyvon.split("-");
				setting.totalProfit = setting.totalProfit + order.profit;
				try {
					if (setting.modeTrade == 2) {
						if (isWin == 0) {
							var index = setting.currentIndex + 1;
							if (index == amounts.length) {
								index = 0;
							}
							setting.currentAmount = Number(amounts[index]);
							setting.currentIndex = index;
						} else {
							index = 0;
							setting.currentAmount = Number(amounts[index]);
							setting.currentIndex = index;
						}
					}

					if (setting.modeTrade == 3) {
						amounts = setting.qlvTier1.split("-");
						var amount2 = setting.qlvTier2.split("-");
						var amount3 =
							setting.flameTier == 3 || setting.flameTier == 4 ? setting.qlvTier3.split("-") : "";

						var amount4 = setting.flameTier == 4 ? setting.qlvTier4.split("-") : "";
						

						if (isWin == 1) {
							setting.flameCountWin = setting.flameCountWin + 1;
							if (setting.flameCountWin == setting.flameTier) {
								setting.flameCountWin = 0;
								setting.currentIndex = 0;
								setting.activeTrade = 0;
							}
							
							if (setting.flameCountWin == 0) {
								setting.currentAmount = Number(amounts[setting.currentIndex]);
							} else if (setting.flameCountWin == 1) {
								setting.currentAmount = Number(amount2[setting.currentIndex]);
							} else if(setting.flameCountWin == 2){
								setting.currentAmount = Number(amount3[setting.currentIndex]);
							} else{
								setting.currentAmount = Number(amount4[setting.currentIndex]);
							}
						} else {
							setting.flameCountWin = 0;
							var index = setting.currentIndex + 1;
							if (index == amounts.length) {
								index = 0;
							}
							setting.currentAmount = Number(amounts[index]);
							setting.currentIndex = index;
						}

						
					}

					var stopTrade = 0;
					if (setting.totalProfit >= setting.chotlai && setting.chotlai > 0) {
						stopTrade = 1;
					}

					if (setting.totalProfit <= -setting.chotlo && setting.chotlo > 0) {
						stopTrade = 2;
					}

					// if(setting.isTranhThiTruongXau == 1){
					// 	if(isWin) {
					// 		setting.countThua = 0;
					// 		setting.counttranhThiTruongXau = 0;
					// 	}
					// 	else{
					// 		setting.countThua = setting.countThua + 1;
					// 		if(setting.countThua == setting.thua_TranhThiTruongXau){
					// 			setting.countThua = 0;
					// 			setting.counttranhThiTruongXau = setting.counttranhThiTruongXau + 1;
					// 			if(setting.setting.counttranhThiTruongXau == setting.tranhThiTruongXau){
					// 				setting.enableTranhThiTruongXau = setting.enableTranhThiTruongXau == 0 ? 1 : 0;
					// 				setting.countThua = 0;
					// 				setting.counttranhThiTruongXau = 0;
					// 			}
					// 		}
					// 	}
					// }


					await setting.save();

					await axios.post(url_trade+'notify-trade',{
					 	accId: order.accId,
						msg: `Lệnh <b>${order.type == 1 ? "Buy" : "Sell"}</b> ${
							isWin == 1 ? "thắng " : "thua"
						} ${order.profit}$`,
						stopTrade: stopTrade,
						totalProfit: setting.totalProfit
					}).catch((er) => {
						console.log(er);
					});
				} catch (errors) {
					axios.post(url_trade + 'stop-trade',{
						accId: order.accId,
						msg: 'Kiểm tra lại quản lý vốn. /show'
					}).catch((er) => {
						console.log(er);
					})
					console.log(errors);
				}
			});
		});
	} catch (err) {
		
		console.log(err);
	}
}

module.exports = function (app) {
	app.route("/").get((req, res) => {
		return res.status(200).json({ message: "ok" });
	});

	app.route("/signal").post(async (res, req) => {
		var accs = await Account.find({ startSignal: 1, actived: 1 });
		if (accs.length == 0) return req.json("error");

		accs.forEach((acc) => {
			SendMsg(
				acc.teleId,
				`Phút ${res.body.serverTime}: Vào lệnh <b>${
					res.body.betType == 1 ? "BUY" : "SELL"
				}</b>`
			);
		});

		axios.post(url_trade+'place-order',{
			serverTime:res.body.serverTime,
			betType: res.body.betType,
			countWin: res.body.countWin,
			countLoss: res.body.countLoss
		}).catch((err) => {
			console.log(err.message);
		});

		return req.json("success");
	});

	app.route("/result").post(async (res, req) => {
		var accs = await Account.find({ startSignal: 1, actived: 1 });
		if (accs.length == 0) return req.json("error");

		accs.forEach(async (acc) => {
			var msg = `Lệnh <b>${res.body.betType == 1 ? "BUY" : "SELL"}</b> ${
				res.body.result == 1 ? "thắng" : "thua"
			}.`;

			if (res.body.result == 1) {
				msg += `\r\nThắng liên tiếp: ${res.body.countWin}`;
			} else {
				msg += `\r\nThua liên tiếp: ${res.body.countLoss}`;
			}

			SendMsg(acc.teleId, msg);
		});

		ResultOrder(res.body.result);

		return req.json("success");
	});
};
