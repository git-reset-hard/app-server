const appServerDB = require('../server/database/mysql.js');
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

describe('MySQL Database Tests', function () {
  
  let userId = 123321;

  it ('check to see if user can be queried in database', function(done) {
    appServerDB.User.findById(userId)
      .then((user) => {
        expect(user.dataValues.id).to.equal(userId);
        done();
      });
  });

  it ('check to see if queries can be inserted and then deleted in database', function(done) {
    let queryObj = {
      type: 'query',
      id: 'abc1234',
      userId: userId,
      searchTerm: 'test',
      location: 12346,
      date: new Date(),
      isPersonalized: true
    };
    appServerDB.Query.create(queryObj)
      .then((result) => {
        expect(result.dataValues.id).to.equal(queryObj.id);
        expect(result.dataValues.searchTerm).to.equal(queryObj.searchTerm);
        expect(result.dataValues.location).to.equal(queryObj.location);

        return appServerDB.Query.destroy({where: {id: queryObj.id}});
      })
      .then((result) => {
        expect(result).to.equal(1);
        done();
      });
  });

  it ('check to see if lists can be inserted and then deleted in database', function(done) {
    let listObj = {
      id: 'abc1234',
    };
    appServerDB.List.create(listObj)
      .then((result) => {
        expect(result.dataValues.id).to.equal(listObj.id);
        return appServerDB.List.destroy({where: {id: listObj.id}});
      })
      .then((result) => {
        expect(result).to.equal(1);
        done();
      });
  });
});