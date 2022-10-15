const mongoose = require('mongoose');


const db_user = process.env.MONGODB_USER;
const db_pass = process.env.MONGODB_PASS;
const db_name = process.env.MONGODB_NAME;

const uri = 'mongodb+srv://'+db_user+':'+db_pass+'@dbthaiminhnhut.unjdakw.mongodb.net/'+db_name+'?retryWrites=true&w=majority';

require('./Account');
require('./Signal.js');
require('./AccountTrade.js');
require('./SettingTrade');
require('./Orders');

mongoose.connect(uri).then((rs) => {
    console.log('Connect db success');   
}).catch(err => {
    console.log(err);
});

