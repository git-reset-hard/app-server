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
    //if generic-- query elasticsearch restaurant list and come up with list
    //else MAKE POST request to recommendations engine

    //return list of restaurants
    res.status(200);
    res.send('Sending back list');

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