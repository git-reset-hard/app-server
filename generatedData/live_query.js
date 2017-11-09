const fs = require('fs');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const requestPromise = require('request-promise-native');
const faker = require('faker');
faker.seed(123);
const logger = require('../server/config/winston-config.js');
const restaurantCats = require('./restaurantDogs.js');

const randomDate = function(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateQuery = function () {
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


  let userIndex = Math.floor(Math.random() * 494800);

  db.User.findOne({
    where: {
      id: userIndex
    }
  })
    .then((user) => {
      if (!user) {
        throw new Error ('user not found');
      }

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
        'uri': 'http://13.57.4.100/searchRestaurants',
        //'uri': 'http://127.0.0.1:2424/searchRestaurants',
        'qs': {
          searchTerm: query.searchTerm,
          location: query.location,
          userId: query.userId,
          date: query.date
        }
      };
      return requestPromise(options);
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
    });
};

var count = 0;

setInterval(function() {
  count++;
  console.log('live query count: ', count);
  generateQuery();

