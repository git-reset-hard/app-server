const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const request = require('request');
const port = process.env.PORT || 2424;
//const restaurantList = require('./database/restaurantdb.js');
const appServerDB = require('./database/mysql.js');

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
        console.log('making a POST', options);
        request(options, (err, response, body) => {
          if (err) {
            console.log ('there was an error posting to recommendations engine ', err);
          }
          console.log('we got a response back! ', body);
          //do stuff with body
          //send copy to database with query
          //query restaurantDB with the list and generate real list of restaurants
          //send full list of restaurant details back to client
          res.status(200);
          res.send('Sending back list');
        });
      })
      .catch((err) => {
        console.log('no user found ', err);
        res.status(400);
        res.send('no user found');
      });
    //if generic-- query elasticsearch restaurant list and come up with list
    //else MAKE POST request to recommendations engine

    //return list of restaurants

    //store query to database along with list
    //send to analytics for storage
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