const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: 'https://search-app-server-ikcfhma3cq4ms4rs6xxnmraoe4.us-west-1.es.amazonaws.com/'
});



module.exports = client;