const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise-native');
const port = process.env.PORT || 2424;
const restaurantList = require('./database/restaurantdb.js');
const appServerDB = require('./database/mysql.js');
const handleQuery = require('./controller/queryHandler.js');
const fs = require('fs');
const shortid = require('shortid');

const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' })
  ]
});


// import entire SDK
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./server/config/config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.status(200);
  res.send('Serving up webpage');
});

//GET handler will use req.query.OBJ to get query string, location and userId of query
app.get('/searchRestaurants', (req, res) => {
  //check to make sure query parameters are valid
  if (req.query.searchTerm || req.query.location || req.query.userId) {
    let logid = shortid.generate();
    let startTime = new Date();

    logger.log({
      level: 'info',
      type: 'log',
      time: startTime,
      process: 'initiate',
      elapsed: new Date() - startTime,
      action: '',
      success: true,
      logid: logid,
    });


    req.query.logid = logid;
    req.query.startTime = startTime;
    handleQuery(req, res);

  } else {
    res.status(400);
    res.send('search parameters cannot be undefined');
  }
});

app.get('/hello', (req, res) => {
  res.status(200).send('hello');
});


server.listen(port, () => {
  console.log(`(>^.^)> Server now listening on ${port}!`);
});