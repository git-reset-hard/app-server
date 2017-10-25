//this file generates fake restaurant data and populates the restaurants MySQL table

const restaurantList = require('../server/database/restaurantdb.js');
const faker = require('faker');
//const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const fs = require('fs');

faker.seed(123);


const makeRestaurant = function(count = 1) {
  //this count determines how many rounds of 10k inserts will be done
  if (count === 10) {
    return;
  }

  let restaurantArr = [];

  for (let i = 0; i < 10000; i++) {
    let restaurantName = faker.fake('{{company.catchPhraseAdjective}} {{company.bsAdjective}} {{company.bsNoun}}');
    let address = faker.fake('{{address.streetAddress}} {{address.streetName}} {{address.streetSuffix}}');
    let city = faker.fake('{{address.cityPrefix}} {{address.city}}');
    let zipcode = '972' + Math.floor(Math.random() * 90 + 10);
    let phone = faker.fake('{{phone.phoneNumber}}');
    let priceRange = Math.ceil(Math.random() * 4);
    let stars = Math.ceil(Math.random() * 5);
    let numberTags = Math.ceil(Math.random() * 10);
    let tags = '';
    
    for (let j = 0; j < numberTags; j++) {
      let tag = faker.fake('{{lorem.word}}');
      tags += tag + ' ';
    }
    let restaurantObj = {
      name: restaurantName,
      address: address,
      city: city,
      zipcode: zipcode,
      phone: phone,
      priceRange: priceRange,
      stars: stars,
      tags: tags
    };
    let restaurantMethod = {
      'create': {
        '_index': 'restaurant',
        '_type': 'item',
        '_id': shortid.generate()
      }
    };

    restaurantArr.push(restaurantMethod);
    restaurantArr.push(restaurantObj);

  }

  restaurantList.bulk({
    body: restaurantArr
  })
    .then(() => {
      console.log('insertion finished round ', count);
      count++;
      //recursively call makeRestaurants function for another round of 10k inserts
      makeRestaurant(count);
    })
    .catch((err) => {
      console.log('insertion error ', error);
    }); 
};

//initialize making restaurants with this function invocation
makeRestaurant();


