const assert = require('assert');
//const { Client } = require('pg');
const request = require('request');
//const dummyData = require('../database/dummydata.js');
//const db = require('../database/index.js');
const serverURL = 'http://127.0.0.1:2424';
//const mysql = require('mysql');
//const httpMocks = require('node-mocks-http');
//const server = require('../server/index.js');
const expect = require('chai').expect;

describe('Server HTTP requests', function () {
  it ('should return index when a GET request is made to root directory of server', function(done) {

    let options = {
      'method': 'GET',
      'uri': 'http://127.0.0.1:2424/'
    };
    request(options, function (err, res, body) {
      
      console.log('this is back from request', body);
      expect(res.statusCode).to.equal(200);
      done();
    });
  });


  it ('make GET with query to /searchRestaurants with generic list user', function(done) {

    let options = {
      'method': 'GET',
      'uri': 'http://127.0.0.1:2424/searchRestaurants',
      'qs': {
        searchTerm: 'aliquid',
        location: '97291',
        userId: 'Sy__W-f0h10W'
      }
    };
    request(options, function (err, res, body) {
      let list = JSON.parse(body);
      console.log(list);
      //expect(list.customized).to.equal(false);
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it ('make GET with query to /searchRestaurants with personalized list user', function(done) {

    let options = {
      'method': 'GET',
      'uri': 'http://127.0.0.1:2424/searchRestaurants',
      'qs': {
        searchTerm: 'aliquid',
        location: '97291',
        userId: 'Sy__Tbf0ohyA-'
      }
    };
    request(options, function (err, res, body) {
      let list = JSON.parse(body);
      //expect(list.customized).to.equal(true);
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it ('make GET with undefined query terms to /searchRestaurants', function(done) {
    let options = {
      'method': 'GET',
      'uri': 'http://127.0.0.1:2424/searchRestaurants',
    };
    request(options, function (err, res, body) {
      
      console.log('this is back from request', body);
      expect(res.statusCode).to.equal(400);
      done();
    });
  });
});


