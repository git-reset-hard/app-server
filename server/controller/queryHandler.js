const request = require('request');
const rp = require('request-promise-native');
const restaurantList = require('../database/restaurantdb.js');
const appServerDB = require('../database/mysql.js');
const shortid = require('shortid');
const fs = require('fs');

const LOG_FILE = './logs/log.log';

const handleQuery = function (req, res) {
  //check userId against database to see if generic list or personalized list will be served
  appServerDB.User.findById(req.query.userId)
    .then((user) => {
      if (user === null) {
        let log = {
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'userReturn',
          action: 'failed user lookup',
          success: false,
          logid: req.query.logid
        };
        fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');
        throw new Error('no user found in database');
      } else if (user.getsPersonalized) {

        let log = {
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'userReturn',
          action: '',
          success: true,
          logid: req.query.logid
        };
        fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');

        let search = {
          type: 'search',
          time: req.query.date,
          userId: req.query.userId,
          location: req.query.location,
          searchTerm: req.query.searchTerm,
          location: {
            lat: user.lat,
            lon: user.long
          },
          logid: req.query.logid
        };
        fs.appendFile(LOG_FILE, JSON.stringify(search) + '\n');

        let options = {
          'method': 'POST',
          //----------THIS LINE WILL NEED TO BE CHANGED TO ACCESS SERVICE OF RECOMMENDATIONS ENGINE-------------
          'uri': 'http://127.0.0.1:2425/recommendationsEngine',
          'body': {
            userId: req.query.userId,
            searchTerm: req.query.searchTerm,
            location: req.query.location
          },
          'json': true,
        };

        let log2 = {
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'getList',
          action: 'send to recommendations',
          success: true,
          logid: req.query.logid
        };
        fs.appendFile(LOG_FILE, JSON.stringify(log2) + '\n');
        //POST made to recommendations engine for a personalized list
        return rp(options);          
      } else {

        let log = {
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'userReturn',
          action: '',
          success: true,
          logid: req.query.logid
        };
        fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');

        let search = {
          type: 'search',
          time: req.query.date,
          userId: req.query.userId,
          location: req.query.location,
          searchTerm: req.query.searchTerm,
          location: {
            lat: user.lat,
            lon: user.long
          },
          logid: req.query.logid
        };

        fs.appendFile(LOG_FILE, JSON.stringify(search) + '\n');
        //query elasticsearch restaurantDB for generic list which matches query

        let log2 = {
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'getList',
          action: 'query for generic list',
          success: true,
          logid: req.query.logid
        };
        fs.appendFile(LOG_FILE, JSON.stringify(log2) + '\n');

        return restaurantList.search({
          index: 'restaurant',
          size: 10,
          body: {
            query: {
              bool: {
                should: [
                  { match: { tags: req.query.searchTerm }},
                  { match: { zipcode: req.query.location }}
                ]
              }
            }
          }
        })
          .then((response) => {

            let log = {
              type: 'log',
              time: new Date(),
              elapsed: new Date() - req.query.startTime,
              process: 'getList',
              action: 'compiling list',
              success: true,
              logid: req.query.logid
            };
            fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');

            let restaurants = response.hits.hits;
            let listObj = {
              id: shortid.generate(),
              customized: false,
            };
            for (let i = 1; i <= restaurants.length; i++) {
              let restaurantIDStr = 'restaurantID_' + i;
              listObj[restaurantIDStr] = restaurants[i - 1]._id;
            }
            return listObj;
          });
      }

    })
    .then((list) => {
      let log = {
        type: 'log',
        time: new Date(),
        elapsed: new Date() - req.query.startTime,
        process: 'getList',
        action: 'lists returned',
        success: true,
        logid: req.query.logid
      };
      fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');
      
      //send copy of list and original query to database
      list.isPersonalized = list.customized;
      appServerDB.List.create(list);


      let log2 = {
        type: 'log',
        time: new Date(),
        elapsed: new Date() - req.query.startTime,
        process: 'compile restaurants',
        action: 'sending list to get restaurant details',
        success: true,
        logid: req.query.logid
      };
      fs.appendFile(LOG_FILE, JSON.stringify(log2) + '\n');

      let queryObj = {
        id: shortid.generate(),
        searchTerm: req.query.searchTerm,
        location: req.query.location,
        servedList: list.id,
        logid: req.query.logid
      };
      appServerDB.Query.create(queryObj);

      //---------------TODO: send copy and query to analytics and customer profiling--------------------------------

      let restaurantArr = [];

      let queryMethod = {
        index: 'restaurant'
      };

      for (let i = 1; i <= 10; i++) {
        let restaurantStr = 'restaurantID_' + i;
        let queryBody = {
          query: {
            match: {
              _id: list[restaurantStr]
            }
          }
        };
        restaurantArr.push(queryMethod);
        restaurantArr.push(queryBody);
      }
      
      //query restaurantDB with the list and generate real list of restaurants
      restaurantList.msearch({
        body: restaurantArr
      })
        .then((restaurants) => {
          let restaurantList = [];
          for (var i in restaurants.responses) {
            restaurantList.push(restaurants.responses[i].hits.hits[0]._source);
          }
          //send full list of restaurant details back to client

          let log = {
            type: 'log',
            time: new Date(),
            elapsed: new Date() - req.query.startTime,
            process: 'complete query',
            action: 'send list back to user',
            success: true,
            logid: req.query.logid
          };
          fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');

          res.status(200);
          res.send(restaurantList);
        })
        .catch((err) => {
          let log = {
            type: 'log',
            time: new Date(),
            elapsed: new Date() - req.query.startTime,
            process: 'compile restaurants',
            action: 'problem querying restaurants from ElasticSearch',
            success: false,
            logid: req.query.logid
          };
          fs.appendFile(LOG_FILE, JSON.stringify(log) + '\n');
          console.log('problem querying restaurants ', err);
        });
    })
    .catch((err) => {
      console.log('error with query ', err);
      res.status(400);
      res.send('no user found');
    });
};

module.exports = handleQuery;
