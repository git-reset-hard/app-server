//this file generates fake user data and populates the user MySQL table

const faker = require('faker');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');

faker.seed(123);

let users = [];

for (let i = 0; i < 10000; i++) {
  let name = faker.fake('{{name.firstName}} {{name.lastName}}');
  let getsPersonalized = (Math.random() >= 0.5);
  
  let userObj = {
    id: shortid.generate(),
    index: i,
    name: name,
    getsPersonalized: getsPersonalized
  };
  users.push(userObj);
}

db.User.bulkCreate(users)
  .then(()=> {
    console.log('users created');
  })
  .catch((err) => {
    console.log('something wrong ', err);
  });


