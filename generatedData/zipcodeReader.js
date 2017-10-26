const fs = require('fs');


fs.readFile('./zipcodes.js', (err, data) => {
  data = data.toString();
  let zipcodes = JSON.parse(data);

  //ZIPCODES Object is available from within this function. Do whatever you need to do from here (eg database insert or lookup or whatever);

  console.log('number of zipcodes available: ', zipcodes.length);
  let randomzipcode = Math.floor(Math.random() * zipcodes.length);
  console.log('random zipcode obj: ', zipcodes[randomzipcode]);

  let populated = [];
  for (let i in zipcodes) {
    if (zipcodes[i].EstimatedPopulation > 1000) {
      populated.push(zipcodes[i]);
    }
  }
  console.log('number of populated zipcodes ', populated.length);
  let randomUser = Math.floor(Math.random() * 325978306);

  let findZipcode = function(index) {
    let count = 0;

    for (let i in populated) {
      count += parseInt(populated[i].EstimatedPopulation);
      if (count >= index) {
        return zipcodes[i].Zipcode;
      }
    }
  };

  let randomZip = findZipcode(randomUser);
  console.log(randomZip);

  //total population in zipcodes with > 1000 is 325978306
});

