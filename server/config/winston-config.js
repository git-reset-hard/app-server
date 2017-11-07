const restaurantList = require('../database/restaurantdb.js');
const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const esTransportOpts = {
  level: 'info',
  client: restaurantList,
  ensureMappingTemplate: false,
  index: 'querytracker',
  transformer: (obj) => {
    let newObj = {};
    for (let i in obj) {
      if (i === 'meta') {
        for (let j in obj.meta) {
          newObj[j] = obj.meta[j];
        }
      } else {
        newObj[i] = obj[i];
      }
    }
    return newObj;
  }
};
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new Elasticsearch(esTransportOpts),
    new winston.transports.File({ filename: '../server/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../server/logs/combined.log' })
  ]
});

module.exports = logger;
