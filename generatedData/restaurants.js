const faker = require('faker');

faker.seed(123);

let restaurantArr = [];

for (let i = 0; i < 10000000; i++) {
  let restaurantId = i;
  let restaurantName = faker.fake('{{company.catchPhraseAdjective}} {{company.bsAdjective}} {{company.bsNoun}}');
  let address = faker.fake('{{address.streetAddress}} {{address.streetName}} {{address.streetSuffix}}');
  let city = faker.fake('{{address.cityPrefix}} {{address.city}}');
  let zipcode = faker.fake('{{address.zipCode}}');
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
    restaurantId: restaurantId,
    restaurantName: restaurantName,
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

console.log(restaurantArr);

