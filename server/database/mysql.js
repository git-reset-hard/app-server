const Sequelize = require('sequelize');
let db;

if (process.env.DATABASE_URL) {
  db = new Sequelize(process.env.DATABASE_URL);
} else {
  db = new Sequelize({
    database: 'app_server',
    username: 'student',
    password: 'student',
    dialect: 'mysql',
    logging: false,
    operatorsAliases: false
  });
}

db.authenticate()
  .then(() => {
    console.log('MYSQL DB connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });



//User Schema
const User = db.define('user', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  index: Sequelize.INTEGER,
  name: Sequelize.STRING,
  hometown: Sequelize.INTEGER,
  lat: Sequelize.INTEGER,
  long: Sequelize.INTEGER,
  getsPersonalized: Sequelize.BOOLEAN
}, {
  indexes: [
    {
      unique: true,
      fields: ['id']
    }
  ]
});

//Queries Schema
const Query = db.define('query', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  userId: Sequelize.STRING,
  numericalIndex: Sequelize.INTEGER,
  searchTerm: Sequelize.STRING,
  location: Sequelize.INTEGER,
  servedList: Sequelize.STRING,
  date: Sequelize.DATE
}, {
  indexes: [
    {
      unique: true,
      fields: ['id']
    }
  ]
});

//List Schema
const List = db.define('list', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  numericalIndex: Sequelize.INTEGER,
  isPersonalized: Sequelize.BOOLEAN,
  restaurantID_1: Sequelize.STRING,
  restaurantID_2: Sequelize.STRING,
  restaurantID_3: Sequelize.STRING,
  restaurantID_4: Sequelize.STRING,
  restaurantID_5: Sequelize.STRING,
  restaurantID_6: Sequelize.STRING,
  restaurantID_7: Sequelize.STRING,
  restaurantID_8: Sequelize.STRING,
  restaurantID_9: Sequelize.STRING,
  restaurantID_10: Sequelize.STRING
}, {
  indexes: [
    {
      unique: true,
      fields: ['id']
    }
  ]
});



//Relationship between User & Query
// User.hasMany(Query);
// Query.belongsTo(User);

//Relationship between Query & List
// List.hasOne(Query);
// Query.belongsTo(List);


User.sync()
  .then(() => List.sync())
  .then(() => Query.sync())
  .catch(error => console.log('error syncing data', error));

module.exports = {
//   Sequelize: Sequelize,
  db: db,
  User: User,
  Query: Query,
  List: List
};
