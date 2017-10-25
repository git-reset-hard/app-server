const request = require('request');
const rp = require('request-promise-native');
const restaurantList = require('../database/restaurantdb.js');
const appServerDB = require('../database/mysql.js');
const shortid = require('shortid');


const handleQuery = function (req, res) {
  //check userId against database to see if generic list or personalized list will be served
  appServerDB.User.findById(req.query.userId)
    .then((user) => {
      if (user === null) {
        throw new Error('no user found in database');
      } else if (user.getsPersonalized) {
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
        //POST made to recommendations engine for a personalized list
        return rp(options);          
      } else {
        //query elasticsearch restaurantDB for generic list which matches query
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
      //send copy of list and original query to database
      list.isPersonalized = list.customized;
      appServerDB.List.create(list);

      let queryObj = {
        id: shortid.generate(),
        searchTerm: req.query.searchTerm,
        location: req.query.location,
        servedList: list.id
      };
      appServerDB.Query.create(queryObj);

      //send copy and query to analytics and customer profiling
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
      
      restaurantList.msearch({
        body: restaurantArr
      })
        .then((restaurants) => {
          let restaurantList = [];
          for (var i in restaurants.responses) {
            restaurantList.push(restaurants.responses[i].hits.hits[0]._source);
          }
          res.status(200);
          res.send(restaurantList);
        })
        .catch((err) => {
          console.log('problem querying restaurants ', err);
        });
      //query restaurantDB with the list and generate real list of restaurants
      //send full list of restaurant details back to client


    })
    .catch((err) => {
      console.log('error with query ', err);
      res.status(400);
      res.send('no user found');
    });
  //if generic-- query elasticsearch restaurant list and come up with list
};

module.exports = handleQuery;
