const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: 'https://search-yelpalytics-appserver-4kvoj4c5vzy22aztu2kzph7mna.us-west-1.es.amazonaws.com/',
  log: 'trace'
});


client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});


// client.create({
//   index: 'restaurant',
//   type: 'item',
//   id: '1',
//   body: {
//     restaurantId: '1',
//     restaurantName: 'Chipotle',
//     address: '123 Main St',
//     city: 'Boston',
//     zipcode: '02453',
//     phone: '123-232-1233',
//     price: '3',
//     rating: '5',
//     tags: 'mexican, fastfood, burritos, taco'
//   }
// })
//   .then((response) => {
//     console.log('insertion successful ', response);
//   })
//   .catch((err) => {
//     console.log('insertion error ', error);
//   }); 

// client.search({
//   index: 'restaurant',
//   q: 'tags:mexican'
// })
//   .then((response) => {
//     console.log('query successful ', response);
//   })
//   .catch((err) => {
//     console.log('query error ', error);
//   }); 

// client.delete({
//   index: 'restaurant',
//   type: 'item',
//   id: '1'
// })
//   .then((response) => {
//     console.log('delete successful ', response);
//   })
//   .catch((err) => {
//     console.log('delete error ', error);
//   }); 

module.exports = client;