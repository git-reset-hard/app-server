const fs = require('fs');
var categories = fs.readFileSync('./categories.json');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const elasticSearch = require('../server/database/restaurantdb.js');

let buffer = fs.readFileSync('./zipcodes.js');
let zipcodes = buffer.toString();
zipcodes = JSON.parse(zipcodes);
console.log(zipcodes[0]);

categories = categories.toString();
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

// for (let k = 0; k < 1; k++) {
//   restaurantCats.push('mexican');
// }

// for (let k = 0; k < 2; k++) {
//   restaurantCats.push('chinese');
// }

// for (let k = 0; k < 3; k++) {
//   restaurantCats.push('alpaca');
// }

const randomDate = function(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateQuery = function (count) {
  if (count > 100000) {
    return;
  }
  count++;
  let queries = [];
  let userIndex = Math.floor(Math.random() * 41276);

  db.User.findAll({
    where: {
      index: userIndex
    }
  })
    .then((users) => {



      for (let i in users) {

        let randomNum = Math.floor(Math.random() * 20);

        for (let j = 0; j < randomNum; j++) {
          let date = randomDate(new Date(2017, 6, 1), new Date());
          let randomQuery = restaurantCats[Math.floor(Math.random() * 221)];
          let lat = 0;
          let long = 0;
          for (let q in zipcodes) {
            if (zipcodes[q].Zipcode === users[i].hometown) {
              lat = zipcodes[q].Lat;
              long = zipcodes[q].Long;
            }
          }
          let query = {
            id: shortid.generate(),
            numericalIndex: i,
            searchTerm: randomQuery,
            geoLocation: [lat, long],
            servedList: null,
            userId: users[i].id,
            date: date
          };
          queries.push(query);
        }

      }
    })
    // .then(()=> {
    //   return db.Query.bulkCreate(queries);
    // })
    .then(()=> {
      let queryArr = [];

      for (let i in queries) {
        let queryMethod = {
          'create': {
            '_index': 'query',
            '_type': 'item',
            '_id': queries[i].id,
            "mappings": {
              "my_type": {
                "properties": {
                  "geoLocation": {
                    "type": "geo_point"
                  }
                }
              }
            }
          }
        };
        queryArr.push(queryMethod);
        queryArr.push(queries[i]);
      }
      return elasticSearch.bulk({
        body: queryArr
      });
    })
    .then(() => {
      console.log('starting next round...', count);
      generateQuery(count);
    })
    .catch((err) => {
      console.log('there was error with user lookup ', err);
      generateQuery(count);
    });
};

generateQuery(0);