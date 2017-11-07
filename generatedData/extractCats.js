// const fs = require('fs');
// let categories = fs.readFileSync('./categories.json').toString();
// categories = JSON.parse(categories);

// let restaurantCats = [];
// for (let i in categories) {
//   for (let j in categories[i].parents) {
//     if (categories[i].parents[j] === 'restaurants') {
//       restaurantCats.push(categories[i].alias);
//     }
//   }
// }

// console.log(restaurantCats);

// fs.writeFileSync('./restaurantDogs.js', JSON.stringify(restaurantCats));

const cats = require('./restaurantDogs.js');

console.log(cats.length);