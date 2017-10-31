const request = require('request');
const rp = require('request-promise-native');
const restaurantList = require('../database/restaurantdb.js');
const appServerDB = require('../database/mysql.js');
const shortid = require('shortid');
const fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./server/config/config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' })
  ]
});

const handleQuery = function (req, res) {
  //check userId against database to see if generic list or personalized list will be served
  appServerDB.User.findById(req.query.userId)
    .then((user) => {
      if (user === null) {
        //log failed user lookup
        logger.log({
          level: 'error',
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'userReturn',
          action: 'failed user lookup',
          success: false,
          logid: req.query.logid
        });

        throw new Error('no user found in database');
      } else if (user.getsPersonalized) {
        //log return of user information from MySQL DB query
        logger.log({
          level: 'info',
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'userReturn',
          action: 'user successfuly retrieved - gets personalized list',
          success: true,
          logid: req.query.logid
        });
        //log search terms with user information
        logger.log({
          level: 'info',
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
        });

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
        //log prior to sending to recommendations
        logger.log({
          level: 'info',
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'getList',
          action: 'send to recommendations',
          success: true,
          logid: req.query.logid
        });

        //POST made to recommendations engine for a personalized list
        return rp(options);          
      } else {
        //log successful user retrieval
        logger.log({
          level: 'info',
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'userReturn',
          action: 'user successfuly retrieved - gets generic list',
          success: true,
          logid: req.query.logid
        });
        //log search term tied with user details
        logger.log({
          level: 'info',
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
        });
        //log prior to sending generic query list retrieval
        logger.log({
          level: 'info',
          type: 'log',
          time: new Date(),
          elapsed: new Date() - req.query.startTime,
          process: 'getList',
          action: 'query for generic list',
          success: true,
          logid: req.query.logid
        });
        //query elasticsearch restaurantDB for generic list which matches query
        //query below prioritizes searchTerm over zipcode (this can be easily adjusted by changing boost values)
        return restaurantList.search({
          index: 'restaurant',
          size: 10,
          body: {
            query: {
              bool: {
                should: [{
                  match: {
                    tags: {
                      query: req.query.searchTerm,
                      boost: 2
                    }
                  }
                },
                {
                  match: {
                    zipcode: {
                      query: req.query.location
                    }
                  }
                }]
              }
            }
          }
        })
          .then((response) => {
            //log list return from elasticSearch generic query
            logger.log({
              level: 'info',
              type: 'log',
              time: new Date(),
              elapsed: new Date() - req.query.startTime,
              process: 'getList',
              action: 'process generic list',
              success: true,
              logid: req.query.logid
            });

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
      //marks list as customized or not
      list.isPersonalized = list.customized;
      list.type = 'list';
      //log that both restaurant list and generic lists have been returned, logs the lists into elasticsearch
      logger.log({
        level: 'info',
        type: 'log',
        time: new Date(),
        elapsed: new Date() - req.query.startTime,
        process: 'getList',
        action: 'lists returned',
        success: true,
        logid: req.query.logid,
        list: list
      });

      
      //send copy of list to database
      appServerDB.List.create(list);

      //log query into elasticSearch restaurants database to access detailed restaurant info
      logger.log({
        level: 'info',
        type: 'log',
        time: new Date(),
        elapsed: new Date() - req.query.startTime,
        process: 'compile restaurants',
        action: 'sending list to get restaurant details',
        success: true,
        logid: req.query.logid
      });

      //send query into MySQL database for storage
      let queryObj = {
        type: 'query',
        id: shortid.generate(),
        userId: req.query.userId,
        searchTerm: req.query.searchTerm,
        location: req.query.location,
        servedList: list.id,
        date: req.query.date,
        isPersonalized: list.customized
      };
      appServerDB.Query.create(queryObj);

      console.log('send to analytics: ', queryObj, list);

      //---------------TODO: send list and query to analytics and customer profiling via SQS--------------------------------
      let querySQS = {
        DelaySeconds: 10,
        MessageBody: JSON.stringify(queryObj),
        QueueUrl: 'https://sqs.us-west-1.amazonaws.com/478994730514/app-serverToAnalytics'
      };

      sqs.sendMessage(querySQS, function(err, data) {
        if (err) {
          console.log('Error"', err);
        } else {
          console.log('Success', data.MessageId);
        }
      });

      list.queryID = queryObj.id;
      let listSQS = {
        DelaySeconds: 10,
        MessageBody: JSON.stringify(list),
        QueueUrl: 'https://sqs.us-west-1.amazonaws.com/478994730514/app-serverToAnalytics'
      };

      sqs.sendMessage(listSQS, function(err, data) {
        if (err) {
          console.log('Error"', err);
        } else {
          console.log('Success', data.MessageId);
        }
      });

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
      //make bulk query to restaurantDB elasticSearch with the list and generate full profile of restaurants
      restaurantList.msearch({
        body: restaurantArr
      })
        .then((restaurants) => {
          let restaurantList = [];
          for (var i in restaurants.responses) {
            restaurantList.push(restaurants.responses[i].hits.hits[0]._source);
          }
          //send full list of restaurant details back to client
          logger.log({
            level: 'info',
            type: 'log',
            time: new Date(),
            elapsed: new Date() - req.query.startTime,
            process: 'complete query',
            action: 'send list back to user',
            success: true,
            logid: req.query.logid
          });

          res.status(200);
          res.send(restaurantList);
        })
        .catch((err) => {
          //log error with querying for restaurants
          logger.log({
            level: 'error',
            type: 'log',
            time: new Date(),
            elapsed: new Date() - req.query.startTime,
            process: 'compile restaurants',
            action: 'problem querying restaurants from ElasticSearch',
            success: false,
            logid: req.query.logid
          });

          console.log('problem querying restaurants ', err);
        });
    })
    .catch((err) => {
      console.log('error with query ', err);
      logger.log({
        level: 'error',
        type: 'log',
        time: new Date(),
        elapsed: new Date() - req.query.startTime,
        process: 'full query',
        action: 'problem with obtaining list and returning to user',
        success: false,
        logid: req.query.logid
      });
      res.status(400);
      res.send('no user found');
    });
};

module.exports = handleQuery;
