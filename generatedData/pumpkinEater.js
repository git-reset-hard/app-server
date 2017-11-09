const locations = require('./pumpkin.js');
const fs = require('fs');

//console.log(typeof locations.location);
let zipArray = locations.location.split('\n');

let zip = [];

for (let i in zipArray) {
  zip.push(zipArray[i].split('\tpumpkins\t'));
}



let thezips = [];

for (let j = 50000; j < 50300; j++) {
  thezips.push(zip[j]);
}

fs.writeFile('./pumpkinparsed.js', JSON.stringify(thezips));