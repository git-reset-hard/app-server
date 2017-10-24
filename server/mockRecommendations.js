const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const request = require('request');
const port = process.env.PORT || 2425;
//const restaurantList = require('./database/restaurantdb.js');
const appServerDB = require('./database/mysql.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



app.post('/recommendationsEngine', (req, res) => {
  console.log('this is recommenations engine ', req.body);
  res.status(200);
  res.send({
    id: '12345',
    customized: true,
    restaurantID_1: Math.floor(Math.random() * 10000),
    restaurantID_2: Math.floor(Math.random() * 10000),
    restaurantID_3: Math.floor(Math.random() * 10000),
    restaurantID_4: Math.floor(Math.random() * 10000),
    restaurantID_5: Math.floor(Math.random() * 10000),
    restaurantID_6: Math.floor(Math.random() * 10000),
    restaurantID_7: Math.floor(Math.random() * 10000),
    restaurantID_8: Math.floor(Math.random() * 10000),
    restaurantID_9: Math.floor(Math.random() * 10000),
    restaurantID_10: Math.floor(Math.random() * 10000),
  });
});






server.listen(port, () => {
  console.log(`(>^.^)> Server now listening on ${port}!`);
});