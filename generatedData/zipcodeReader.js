const fs = require('fs');


fs.readFile('./zipcodes.js', (err, data) => {
  data = data.toString();
  let zipcodes = JSON.parse(data);

  //ZIPCODES Object is available from within this function. Do whatever you need to do from here (eg database insert or lookup or whatever);

  console.log('number of zipcodes available: ', zipcodes.length);
  let randomzipcode = Math.floor(Math.random() * zipcodes.length);
  console.log('random zipcode obj: ', zipcodes[randomzipcode]);
});

