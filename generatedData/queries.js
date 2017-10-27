const fs = require('fs');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const elasticSearch = require('../server/database/restaurantdb.js');

let categories = fs.readFileSync('./categories.json').toString();
categories = JSON.parse(categories);

let restaurantCats = [];
for (let i in categories) {
  for (let j in categories[i].parents) {
    if (categories[i].parents[j] === 'restaurants') {
      for (let z = 0; z < Math.floor(Math.random() * 4); z++) {
        restaurantCats.push(categories[i].alias);
      }
    }
  }
}

const randomDate = function(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateQuery = function (count) {
  if (count > 100000) {
    return;
  }
  count++;
  let queries = [];
  let userIndex = Math.floor(Math.random() * 22) * 1000;

  db.User.findAll({
    where: {
      index: userIndex
    }
  })
    .then((users) => {
      console.log(users.length);


      for (let i in users) {

        let randomNum = Math.floor(Math.random() * 20);

        for (let j = 0; j < randomNum; j++) {
          let date = randomDate(new Date(2017, 6, 1), new Date());
          let randomQuery = restaurantCats[Math.floor(Math.random() * 221)];


          let query = {
            id: shortid.generate(),
            numericalIndex: i,
            searchTerm: randomQuery,
            testLocation: {
              lat: users[i].lat, 
              lon: users[i].long
            },
            servedList: null,
            userId: users[i].id,
            date: date
          };
          queries.push(query);
          console.log(query);
        }
      }
    })
    .then(()=> {
      return db.Query.bulkCreate(queries);
    })
    .then(()=> {
      let queryArr = [];

      for (let i in queries) {
        let queryMethod = {
          'create': {
            '_index': 'newmap',
            '_type': 'item',
            '_id': queries[i].id
          }
        };
        queryArr.push(queryMethod);
        queryArr.push(queries[i]);
      }
      return elasticSearch.bulk({
        body: queryArr
      });
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