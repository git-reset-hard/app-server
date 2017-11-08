const elasticSearch = require('../database/restaurantdb.js');

var restaurantArr = [];
var count = 0;

const addRestaurant = function(restaurantObj, done) {
  count++;
  restaurantArr.push(restaurantObj);
  if (restaurantArr.length === 1000 || count === 101378) {
    makeBulkRestaurant(done);
  } else {
    done();
  }
};

const makeBulkRestaurant = function(done) {
  let bulk = [];

  for (let i = 0; i < restaurantArr.length; i++) {
    let restaurantMethod = {
      'update': {
        '_index': 'restaurantprod',
        '_type': 'restaurant',
        '_id': restaurantArr[i].id
      }
    };
    let elasticSearchObj = {
      'doc': restaurantArr[i]
    };
    bulk.push(restaurantMethod);
    bulk.push(elasticSearchObj);
  }

  elasticSearch.bulk({
    body: bulk
  })
    .then((result) => {
      restaurantArr = [];
      console.log('1000 restaurants sucessfully inserted into elasticSearch');
      done();
    })
    .catch((err) => {
      console.log('insertion error ', err);
    }); 
};




module.exports = addRestaurant;