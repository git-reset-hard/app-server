//this file generates fake user data and populates the user MySQL table

const faker = require('faker');
const db = require('../server/database/mysql.js');
const shortid = require('shortid');
const fs = require('fs');
faker.seed(123);

fs.readFile('./zipcodes.js', (err, data) => {
  data = data.toString();
  let zipcodes = JSON.parse(data);

  //ZIPCODES Object is available from within this function. Do whatever you need to do from here (eg database insert or lookup or whatever);

  // console.log('number of zipcodes available: ', zipcodes.length);
  // let randomzipcode = Math.floor(Math.random() * zipcodes.length);
  // console.log('random zipcode obj: ', zipcodes[randomzipcode]);

  let populated = [];
  let population
  for (let i in zipcodes) {
    if (zipcodes[i].EstimatedPopulation > 1000) {

      populated.push(zipcodes[i]);
    }
  }


  const generateUser = function(count) {
    if (count > 1) {
      return;
    }
    count++;
    let users = [];
    //41276
    //3762
    for (let i = 39426; i < populated.length; i++) {
      for (let j = 0; j < parseInt(populated[i].EstimatedPopulation); j += 1000) {
        let name = faker.fake('{{name.firstName}} {{name.lastName}}');
        let getsPersonalized = (Math.random() >= 0.5);
        let zipcode = populated[i].Zipcode;

        //pull real zipcode from zipcode file
        
        let userObj = {
          id: shortid.generate(),
          index: i,
          name: name,
          getsPersonalized: getsPersonalized,
          hometown: zipcode
        };
        users.push(userObj);
      }
    }

    db.User.bulkCreate(users)
      .then(()=> {
        console.log('users created ', count);
        generateUser(count);
      })
      .catch((err) => {
        console.log('something wrong ', err);
      });
  };
  generateUser(0);
  //console.log(generateUser());


});




