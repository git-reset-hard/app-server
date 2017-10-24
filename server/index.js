const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise-native');
const port = process.env.PORT || 2424;
const restaurantList = require('./database/restaurantdb.js');
const appServerDB = require('./database/mysql.js');
const shortid = require('shortid');

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
    //check userId against database to see if generic list or personalized list will be served
    appServerDB.User.findById(req.query.userId)
      .then((user) => {
        if (user === null) {
          throw new Error('no user found in database');
        } else if (user.getsPersonalized) {
          let options = {
            'method': 'POST',
            'uri': 'http://127.0.0.1:2425/recommendationsEngine',
            'body': {
              userId: req.query.userId,
              searchTerm: req.query.searchTerm,
              location: req.query.location
            },
            'json': true,
          };
          //else MAKE POST request to recommendations engine
          return rp(options);          
        } else {
          //query elasticsearch restaurant DB for best list which matches query
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
        res.status(200);
        res.send(list);
        //send copy to database with query
        
        //send copy and query to analytics
        //query restaurantDB with the list and generate real list of restaurants
        //send full list of restaurant details back to client


      })
      .catch((err) => {
        console.log('error with query ', err);
        res.status(400);
        res.send('no user found');
      });
    //if generic-- query elasticsearch restaurant list and come up with list


  } else {
    res.status(400);
    res.send('search parameters cannot be undefined');
  }
});







// restaurantList.search({
//   index: 'restaurant',
//   q: 'tags:mexican'
// })
//   .then((response) => {
//     console.log('query successful ', response);
//   })
//   .catch((err) => {
//     console.log('query error ', error);
//   }); 



server.listen(port, () => {
  console.log(`(>^.^)> Server now listening on ${port}!`);
});