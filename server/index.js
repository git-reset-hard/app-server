const config = require('./config/env.json')[process.env.NODE_ENV || 'development'];
const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise-native');
const restaurantList = require('./database/restaurantdb.js');
const appServerDB = require('./database/mysql.js');
const handleQuery = require('./controller/queryHandler.js');
const fs = require('fs');
const shortid = require('shortid');
//const uploadLogs = require('./logs/logUploader.js');

const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const esTransportOpts = {
  level: 'info',
  client: restaurantList,
  ensureMappingTemplate: false,
  index: 'querytracker',
  transformer: (obj) => {
    let newObj = {};
    for (let i in obj) {
      if (i === 'meta') {
        for (let j in obj.meta) {
          newObj[j] = obj.meta[j];
        }
      } else {
        newObj[i] = obj[i];
      }
    }
    return newObj;
  }
};
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new Elasticsearch(esTransportOpts),
    new winston.transports.File({ filename: '../server/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../server/logs/combined.log' })
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
      logid: logid
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


server.listen(config.port, () => {
  console.log(`(>^.^)> Server now listening on ${config.port}!`);
});