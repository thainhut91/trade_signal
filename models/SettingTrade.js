const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingTradeSchema = new Schema({
    accId:{
        type: Object,
        required: true
    },
	quanlyvon: {
        type: String,
        default: '1-2-3-4-5'
    },
    totalProfit: {
      type: Number,
      default: 0  
    },
    chotlai: {
        type: Number,
        default :0
    },
    chotlo: {
        type: Number,
        default :0
    },
    currentAmount: {
        type: Number,
        default:1
    },
    currentIndex: {
        type: Number,
        default: 0
    },
    modeTrade: {
        type: Number,
        default: 0
    },
    flameTier:{
        type: Number,
        default: 2
    },
    flameCountWin :{
        type: Number,
        default : 0
    },
    qlvTier1: {
        type: String,
    },
    qlvTier2: {
        type: String,
    },
    qlvTier3: {
        type: String,
    },
    qlvTier4: {
        type: String,
    },
    choThuaChuoi:{
        type: Number,
        default: 0
    },
    ThuaChuoi: {
        type: Number,
        default :0
    },
    choThuaLenh: {
        type: Number,
        default: 0
    },
    activeTrade: {
        type: Number,
        default: 0
    },
    totalVolume: {
        type: Number,
        default: 0
    },
    isTranhThiTruongXau: {
        type: Number,
        default: 0
    },
    thua_TranhThiTruongXau:{
        type: Number,
        default: 0
    },
    tranhThiTruongXau:{
        type: Number,
        default: 0
    },
    countThua:{
        type: Number,
        default: 0
    },    
    counttranhThiTruongXau:{
        type: Number,
        default: 0
    },
    enableTranhThiTruongXau: {
        type: Number,
        default: 0
    },
	created: {
		type: Date,
		default: Date.now,
	},
});

const SettingTrade = mongoose.model("SettingTrade", SettingTradeSchema);

module.exports = SettingTrade;
