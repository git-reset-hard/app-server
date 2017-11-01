//this file generates fake restaurant data and populates the restaurants MySQL table

const restaurantList = require('../server/database/restaurantdb.js');
const faker = require('faker');
//const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const fs = require('fs');

faker.seed(123);

let categories = fs.readFileSync('./categories.json').toString();
categories = JSON.parse(categories);

let restaurantCategories = [];
for (let i in categories) {
  for (let j in categories[i].parents) {
    if (categories[i].parents[j] === 'restaurants') {
      for (let z = 0; z < Math.floor(Math.random() * 4); z++) {
        restaurantCategories.push(categories[i].alias);
      }
    }
  }
}

let zipcodes = fs.readFileSync('./zipcodes.js').toString();
zipcodes = JSON.parse(zipcodes);

let populated = [];
for (let i in zipcodes) {
  if (zipcodes[i].EstimatedPopulation > 1000 && zipcodes[i].Zipcode > 10000) {
    populated.push(zipcodes[i]);
  }
}



const makeRestaurant = function(count = 1) {
  //this count determines how many rounds of 10k inserts will be done
  if (count === 100) {
    return;
  }

  let restaurantArr = [];

  for (let i = 0; i < 10000; i++) {

    var randomIndex = Math.random();
    var randomIndex1 = Math.random();
    let restaurantName = faker.fake('{{company.catchPhraseAdjective}} {{company.bsAdjective}} {{company.bsNoun}}');
    let address = faker.fake('{{address.streetAddress}} {{address.streetName}} {{address.streetSuffix}}');
    let city = faker.fake('{{address.cityPrefix}} {{address.city}}');
    let zipcode = populated[Math.floor(randomIndex * populated.length)].Zipcode;
    let phone = faker.fake('{{phone.phoneNumber}}');
    let priceRange = Math.ceil(randomIndex * 4);
    let stars = Math.ceil(randomIndex1 * 5);
    let numberTags = Math.ceil(randomIndex * 10);
    let tags = '';
    
    for (let j = 0; j < numberTags; j++) {
      let index = Math.floor(Math.random() * restaurantCategories.length);
      let tag = restaurantCategories[index];
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
      makeRestaurant(count);
    })
    .catch((err) => {
      console.log('insertion error ', error);
    }); 
};

//initialize making restaurants with this function invocation
makeRestaurant();


