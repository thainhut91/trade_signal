require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors({}));

require('./models/index.js');

const notifySignal = require('./telegram/index.js');

notifySignal.Start();



let routes = require("./route.js"); 
routes(app);

app.listen(port,  err => {
    if(err) throw err;
    console.log("Server running");
});

