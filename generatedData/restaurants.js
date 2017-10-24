//this file generates fake restaurant data and populates the restaurants MySQL table


const faker = require('faker');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');

faker.seed(123);

let restaurantArr = [];

for (let i = 0; i < 10000; i++) {
  let restaurantId = i;
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
    id: shortid.generate(),
    index: i,
    name: restaurantName,
    address: address,
    city: city,
    zipcode: zipcode,
    phone: phone,
    priceRange: priceRange,
    stars: stars,
    tags: tags
  };
  restaurantArr.push(restaurantObj);
}

db.Restaurant.bulkCreate(restaurantArr)
  .then(()=> {
    console.log('restaurants created');
  })
  .catch((err) => {
    console.log('something wrong ', err);
  });

