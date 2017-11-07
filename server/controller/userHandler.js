const db = require('../database/mysql.js');

var userArr = [];

const addUser = function(userObj, done) {
  userArr.push(userObj);

  if (userArr.length === 1000) {
    db.User.bulkCreate(userArr)
      .then(() => {
        console.log('1000 users inserted into DB');
        done();
        userArr = [];
      })
      .catch((err) => {
        console.log('there was an insertion error with user to DB', err);
      });
  } else {
    done();
  }
};




module.exports = addUser;