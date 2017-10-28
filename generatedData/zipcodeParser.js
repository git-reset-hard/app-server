const fs = require('fs');

fs.readFile('./free-zipcode-database.csv', (err, data) => {
  data = data.toString();
  let newLine = data.split('\n');
  let store = [];
  for (let i in newLine) {
    let temp = newLine[i].split(',');
    for (let j in temp) {
      temp[j] = temp[j].replace(/['"]+/g, '');
    }

    let zipObj = {};

    zipObj.RecordNumber = parseInt(temp[0]);
    zipObj.Zipcode = parseInt(temp[1]);
    zipObj.ZipcodeType = temp[2];
    zipObj.City = temp[3];
    zipObj.State = temp[4];
    zipObj.LocationType = temp[5];
    zipObj.Lat = parseInt(temp[6]);
    zipObj.Long = parseInt(temp[7]);
    zipObj.Xaxis = parseInt(temp[8]);
    zipObj.Yaxis = parseInt(temp[9]);
    zipObj.Zaxis = parseInt(temp[10]);
    zipObj.WorldRegion = temp[11];
    zipObj.Country = temp[12];
    zipObj.LocationText = temp[13];
    zipObj.Location = temp[14];
    zipObj.Decommisioned = temp[15];
    zipObj.TaxReturnsFiled = temp[16];
    zipObj.EstimatedPopulation = temp[17];
    zipObj.TotalWages = temp[18];
    zipObj.Notes = temp[19];

    store.push(zipObj);
  }

  fs.writeFile('zipcodes.js', JSON.stringify(store), (err) => {
    if (err) {
      throw err;
    } 
    console.log('The file has been saved!');
  });
});