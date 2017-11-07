const elasticSearch = require('../database/restaurantdb.js');

var restaurantArr = [];

const addRestaurant = function(restaurantObj, done) {
  restaurantArr.push(restaurantObj);
  if (restaurantArr.length === 1000) {
    makeBulkRestaurant(done);
  } else {
    done();
  }
};

const makeBulkRestaurant = function(done) {
  let bulk = [];

  for (let i = 0; i < restaurantArr.length; i++) {
    let restaurantMethod = {
      'create': {
        '_index': 'restaurantprod',
        '_type': 'restaurant',
        '_id': restaurantArr[i].id
      }
    };
    bulk.push(restaurantMethod);
    bulk.push(restaurantArr[i]);
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