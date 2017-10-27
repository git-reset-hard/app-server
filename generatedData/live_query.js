const fs = require('fs');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const elasticSearch = require('../server/database/restaurantdb.js');
const rp = require('request-promise-native');
const faker = require('faker');
faker.seed(123);

// let categories = fs.readFileSync('./categories.json').toString();
// categories = JSON.parse(categories);

// let restaurantCats = [];
// for (let i in categories) {
//   for (let j in categories[i].parents) {
//     if (categories[i].parents[j] === 'restaurants') {
//       for (let z = 0; z < Math.floor(Math.random() * 4); z++) {
//         restaurantCats.push(categories[i].alias);
//       }
//     }
//   }
// }

const randomDate = function(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateQuery = function (count) {
  if (count > 2000) {
    return;
  }
  count++;

  let userIndex = Math.floor(Math.random() * 37656);

  db.User.findAll({
    where: {
      index: userIndex
    }
  })
    .then((users) => {

      let number = users.length;
      let random = Math.floor(Math.random() * number);
      
      let date = randomDate(new Date(2017, 6, 1), new Date());
      //let randomQuery = restaurantCats[Math.floor(Math.random() * 221)];
      let randomQuery = faker.fake('{{lorem.word}}');

      let query = {
        id: shortid.generate(),
        searchTerm: randomQuery,
        location: users[random].hometown,
        userId: users[random].id,
        date: date
      };
      return query;

    })
    .then((query)=> {
      let options = {
        'method': 'GET',
        'uri': 'http://127.0.0.1:2424/searchRestaurants',
        'qs': {
          searchTerm: query.searchTerm,
          location: query.location,
          userId: query.userId,
          date: query.date
        }
      };
      return rp(options);
    })
    .then((result) => {
      console.log('starting next round...', count);
      generateQuery(count);
    })
    .catch((err) => {
      console.log('there was error with user lookup ', err);
      generateQuery(count);
    });
};

generateQuery(0);