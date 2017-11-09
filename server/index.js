const config = require('./config/env.json')[process.env.NODE_ENV || 'development'];
const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const handleQuery = require('./controller/queryHandler.js');
const handleRestaurant = require('./controller/restaurantHandler.js');
const handleUser = require('./controller/userHandler.js');
const shortid = require('shortid');
const logger = require('./config/winston-config.js');
const restaurantList = require('./database/restaurantdb.js');
const Consumer = require('sqs-consumer');
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

//Restaurant details need to be updated from Restaurant Inventory Service on a regular basis
const restaurantSQS = Consumer.create({
  queueUrl: 'https://sqs.us-west-1.amazonaws.com/213354805027/appserver',
  batchSize: 10,
  handleMessage: (message, done) => {
    let body = JSON.parse(message.Body);
    let restaurantObj = {
      id: body.id,
      name: body.name,
      city: body.city,
      state: body.state,
      zipcode: body.zipcode,
      phone: body.phone,
      priceRange: body.price,
      tags: body.categories,
      stars: body.rating,
      location: body.latitude + ',' + body.longitude
    };
    handleRestaurant(restaurantObj, done);
  },
  sqs: new AWS.SQS()
});
 
restaurantSQS.on('error', (err) => {
  console.log(err.message);
});
 
restaurantSQS.start();
console.log('listening for SQS messages from restaurant profiler...');

// Users are grabbed from message bus so that user database can be populated. User database is used to generate random queries for simulation purposes.
const usersSQS = Consumer.create({
  queueUrl: 'https://sqs.us-west-1.amazonaws.com/321889521012/usersToAnalytics',
  batchSize: 10,
  handleMessage: (message, done) => {
    let body = JSON.parse(message.Body);

    let userObj = {
      id: body.numId,
      name: body.name,
      getsPersonalized: body.gets_recommendations,
      hometown: body.zipCode,
      lat: body.latitude,
      long: body.longitude
    };
    handleUser(userObj, done);
  },
  sqs: new AWS.SQS()
});
 
usersSQS.on('error', (err) => {
  console.log(err.message);
});
 
usersSQS.start();
console.log('listening for SQS messages from user profiler...');

server.listen(config.port, () => {
  console.log(`(>^.^)> Server now listening on ${config.port}!`);
});