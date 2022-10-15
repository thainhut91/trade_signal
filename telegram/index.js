"use strict";
var mongoose = require('mongoose'),
    Account = mongoose.model('AccountSignal'),
    Signal = mongoose.model('Signal');

//const TradeBo = require('./../tradeBo.js');

const TeleBot = require('telebot');
const Convert = require('../cores/convert.js');

const token = process.env.TOKEN_TELEGRAM;

const bot = new TeleBot({
    token: token,
    usePlugins: ['askUser', 'commandButton'],
    polling: { // Optional. Use polling.
        interval: 1000, // Optional. How often check updates (in ms).
        timeout: 0, // Optional. Update polling timeout (0 - short polling).
        limit: 100, // Optional. Limits the number of updates to be retrieved.
        retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
        //proxy: 'http://username:password@yourproxy.com:8080' // Optional. An HTTP proxy to be used.
    },
});


bot.on(['/start'],async (msg) =>{

    var finded = await Account.findOne({username: msg.from.username, teleId: msg.from.id});
    if(!finded){
        var newAcc = new Account({
            username: msg.from.username,
            teleId: msg.from.id
        });
        await newAcc.save();
        finded = newAcc;
    }

    return bot.sendMessage(msg.from.id, `Welcome ${finded.username} to Signals bot!`);// msg.reply.text();
});

bot.on('/active', async (msg) => {
    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id});
    if(!acc) return bot.sendMessage(msg.from.id, 'Bạn chưa bắt đầu bot! Vui lòng /start trước!');

    if(acc.actived == 1) return msg.reply.text('Tài khoản đã kích hoạt!');

    return bot.sendMessage(msg.from.id, 'Vui lòng nhập mã kích hoạt: ',{ask: "code",})
});

bot.on('ask.code', async (msg) => {
    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id});
    if(!acc) return bot.sendMessage(msg.from.id, 'Bạn chưa bắt đầu bot! Vui lòng /start trước!');

    if(acc._id.toString() == msg.text){
        acc.actived = 1;
        await acc.save();
        return msg.reply.text('Tài khoản đã được kích hoạt! Vui lòng nhập /start_signal để bắt đầu nhận tín hiệu. Nếu không muốn nhận tiếp thì vui lòng nhập /stop_signal');
    }

    return msg.reply.text('Mã kích hoạt không đúng');
});

bot.on(['/start_signal', '/stop_signal'], async (msg) => {
    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id, actived: 1});
    if(!acc) return bot.sendMessage(msg.from.id, 'Tài khoản chưa kích hoạt! Vui lòng nhập /active để kích hoạt tài khoản!');

    acc.startSignal = msg.text.includes('/start') ? 1:0;
    await acc.save();

    if(acc.startSignal == 1){
        return msg.reply.text('Bắt đầu nhận tín hiệu!');
    }

    return msg.reply.text('Dừng nhận tín hiệu!');
});

bot.on('/finduser', async (msg) => {
    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id, actived: 1});
    if(!acc) return bot.sendMessage(msg.from.id, 'Tài khoản chưa kích hoạt! Vui lòng nhập /active để kích hoạt tài khoản!');

    if(acc.role != 'admin') return msg.reply.text(`Mục này chỉ dành cho quản lý!`);

    var temps = msg.text.split(' ');
    if(temps.length > 1){
        var finded = await Account.findOne({username: temps[1]});
        if(!finded) return msg.reply.text(`Không tìm thấy user! Vui lòng kiểm tra lại`);


        return bot.sendMessage(msg.from.id, 
            "Mã kích hoạt của @"+finded.username+" là: `"+finded._id.toString()+"`"
        ,{parseMode: 'Markdown'});
    }
    return msg.reply.text(`Chưa nhập username!`);

});

var flag_ask = 0;
bot.on('/addsignal',async (msg) => {
    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id, actived: 1});
    if(!acc) return bot.sendMessage(msg.from.id, 'Tài khoản chưa kích hoạt! Vui lòng nhập /active để kích hoạt tài khoản!');

    if(acc.role != 'admin') return msg.reply.text(`Mục này chỉ dành cho quản lý!`);
    flag_ask = 1;
    return bot.sendMessage(msg.from.id,
        `Nhập vào danh sách tín hiệu theo mẫu sau:\r\n`+
        `2b3s1b_b\r\n`+
        `1s3b_s\r\n`+
        `Để hủy vui lòng gõ /empty`,
    {ask: 'signals'})
});
bot.on('ask.signals', async (msg) => {
    if(msg.text == '/empty') return;

    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id, actived: 1});
    if(!acc) return bot.sendMessage(msg.from.id, 'Tài khoản chưa kích hoạt! Vui lòng nhập /active để kích hoạt tài khoản!');

    if(acc.role != 'admin') return msg.reply.text(`Mục này chỉ dành cho quản lý!`);
    try{
        var list_signal = msg.text.split(/\r\n|\r|\n/);
        list_signal.forEach(async (signal) => {

            if(signal.split('_').length-1 == 1){

                var tinhieu = Convert.ChuyenDoiTinHieu(signal.split('_')[0]);
                var typeOFtinhieu = signal.split('_')[1];

                await Signal.deleteMany({signalConvert: tinhieu});
               
                var newSignal = new Signal({
                    signal: signal,
                    signalConvert: tinhieu,
                    orderOfSignal: Number(typeOFtinhieu == 'b' ? 1 : 2),
                    signalLength: tinhieu.length
                });
                await newSignal.save();
            }
            
        });

        return msg.reply.text('Cập nhật tín hiệu thành công');
    }catch(err){
        return msg.reply.text(err.message);
    }
    
});
bot.on('/empty', async (msg) => {
    flag_ask = 0;
    return msg.reply.text('Cancel');
});

bot.on('/list_signal', async (msg) => {
    var acc = await Account.findOne({username: msg.from.username, teleId: msg.from.id, actived: 1});
    if(!acc) return bot.sendMessage(msg.from.id, 'Tài khoản chưa kích hoạt! Vui lòng nhập /active để kích hoạt tài khoản!');

    if(acc.role != 'admin') return msg.reply.text(`Mục này chỉ dành cho quản lý!`);

    var list_signal = await Signal.find({});
    var content = '';
    var index = 1;
    list_signal.forEach((signal) => {
        content += `${index}) <b>${signal.signal}</b>. Remove: /rv${signal.signal}\r\n`;
        index++;
    });
    return bot.sendMessage(msg.from.id, content, { parseMode: 'html'});
});

bot.on(/\/rv(.+)/,async (msg, match) => {
    await Signal.deleteOne({signal: match.match[1]});
    return msg.reply.text(`Đã xóa tín hiệu: ${match.match[1]}`);
});

module.exports = {
    Start: function(){
        bot.start();
    },
    SendMsg:  function(teleId, msg){
         bot.sendMessage(teleId,msg,{parseMode: 'html'});
    }
}