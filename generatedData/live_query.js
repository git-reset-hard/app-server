const fs = require('fs');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const restaurantList = require('../server/database/restaurantdb.js');
const rp = require('request-promise-native');
const faker = require('faker');
faker.seed(123);

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

let categories = fs.readFileSync('./categories.json').toString();
categories = JSON.parse(categories);

let restaurantCats = [];
for (let i in categories) {
  for (let j in categories[i].parents) {
    if (categories[i].parents[j] === 'restaurants') {
      for (let z = 0; z < Math.floor(Math.random() * 4); z++) {
        restaurantCats.push(categories[i].alias);
      }
    }
  }
}

const randomDate = function(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateQuery = function (count) {
  let startTime = new Date();
  let logid = shortid.generate();
  logger.log({
    level: 'info',
    type: 'query',
    time: new Date(),
    elapsed: new Date() - startTime,
    process: 'begin query',
    action: 'initiate',
    success: true,
    logid: logid
  });
  if (count > 10000) {
    return;
  }
  count++;

  let userIndex = Math.floor(Math.random() * 10432841);

  db.User.findOne({
    where: {
      id: userIndex
    }
  })
    .then((user) => {
      logger.log({
        level: 'info',
        type: 'query',
        time: new Date(),
        elapsed: new Date() - startTime,
        process: 'user selection',
        action: 'retrieved list of users',
        success: true,
        logid: logid
      });

      
      let date = randomDate(new Date(2017, 6, 1), new Date());
      let randomQuery = restaurantCats[Math.floor(Math.random() * restaurantCats.length)];


      let query = {
        id: shortid.generate(),
        searchTerm: randomQuery,
        location: user.hometown,
        userId: user.id,
        date: date
      };
      return query;

    })
    .then((query)=> {
      logger.log({
        level: 'info',
        type: 'query',
        time: new Date(),
        elapsed: new Date() - startTime,
        process: 'user selection',
        action: 'processed user and sending off query',
        success: true,
        logid: logid
      });
      let options = {
        'method': 'GET',
        'uri': 'http://54.153.22.50/searchRestaurants',
        'qs': {
          searchTerm: query.searchTerm,
          location: query.location,
          userId: query.userId,
          date: query.date
        }
      };
      return rp(options);
    })
    .then((result) => {
      logger.log({
        level: 'info',
        type: 'query',
        time: new Date(),
        elapsed: new Date() - startTime,
        process: 'completion',
        action: 'query completed',
        success: true,
        logid: logid
      });
      console.log('starting next round...', count);
      generateQuery(count);
    })
    .catch((err) => {
      logger.log({
        level: 'info',
        type: 'query',
        time: new Date(),
        elapsed: new Date() - startTime,
        process: 'completion',
        action: 'query failed',
        success: false,
        logid: logid
      });
      console.log('there was error with user lookup ', err);
      generateQuery(count);
    });
};

generateQuery(0);