//this file generates fake user data and populates the user MySQL table

const faker = require('faker');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const fs = require('fs');
faker.seed(123);

let zipcodes = fs.readFileSync('./zipcodes.js').toString();
zipcodes = JSON.parse(zipcodes);

let populated = [];
for (let i in zipcodes) {
  if (zipcodes[i].EstimatedPopulation > 1000 && zipcodes[i].Zipcode > 10000) {
    populated.push(zipcodes[i]);
  }
}


var count = 0;
const generateUser = function(start, end) {

  let users = [];
  //37656 populated zipcodes
  for (let i = start; i < end; i++) {
    for (let j = 0; j < parseInt(populated[i].EstimatedPopulation); j += 1000) {
      count++;
      let name = faker.fake('{{name.firstName}} {{name.lastName}}');
      let getsPersonalized = (Math.random() >= 0.5);
      let zipcode = populated[i].Zipcode;

      //pull real zipcode from zipcode file
      
      let userObj = {
        name: name,
        getsPersonalized: getsPersonalized,
        hometown: zipcode,
        lat: populated[i].Lat,
        long: populated[i].Long
      };
      users.push(userObj);
    }
  }

  db.User.bulkCreate(users)
    .then(()=> {
      start = end;
      end += 3000;
      if (start === 37656) {
        start = 0;
        end = 3000;
      }
      console.log('next round...', start, count);
      if (end >= 37656) {
        generateUser(start, 37656);
      } else {
        generateUser(start, end);
      }
    })
    .catch((err) => {
      console.log('something wrong ', err);
    });
};
generateUser(0, 3000);




