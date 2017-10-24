const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const request = require('request');
const port = process.env.PORT || 2425;
//const restaurantList = require('./database/restaurantdb.js');
const appServerDB = require('./database/mysql.js');
const shortid = require('shortid');
const restaurantList = require('./database/restaurantdb.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let getRandomRestaurant = () => {
  let a = new Date().getTime().toString();
  return new Promise((resolve, reject) => {
    restaurantList.search({
      index: 'restaurant',
      size: 10,
      body: { query: {
        function_score: {
          random_score: { seed: a }
        }
      }}
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.hits.hits);
      }
    });
  });
};

app.post('/recommendationsEngine', (req, res) => {
  let listObj = {
    id: shortid.generate(),
    customized: true,
  };

  getRandomRestaurant()
    .then((restaurants) => {
      for (let i = 1; i <= restaurants.length; i++) {
        let restaurantIDStr = 'restaurantID_' + i;
        listObj[restaurantIDStr] = restaurants[i - 1]._id;
      }
      res.status(200);
      res.send(listObj);
    })
    .catch((err) => {
      console.log('query to elasticsearch db failed', err);
    });
});






server.listen(port, () => {
  console.log(`(>^.^)> Server now listening on ${port}!`);
});