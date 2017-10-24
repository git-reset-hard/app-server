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
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  searchTerm: Sequelize.STRING,
  location: Sequelize.INTEGER
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
  index: Sequelize.INTEGER,
  isPersonalized: Sequelize.BOOLEAN,
  restaurantID_1: Sequelize.INTEGER,
  restaurantID_2: Sequelize.INTEGER,
  restaurantID_3: Sequelize.INTEGER,
  restaurantID_4: Sequelize.INTEGER,
  restaurantID_5: Sequelize.INTEGER,
  restaurantID_6: Sequelize.INTEGER,
  restaurantID_7: Sequelize.INTEGER,
  restaurantID_8: Sequelize.INTEGER,
  restaurantID_9: Sequelize.INTEGER,
  restaurantID_10: Sequelize.INTEGER
}, {
  indexes: [
    {
      unique: true,
      fields: ['id']
    }
  ]
});

//Restaurant schema
const Restaurant = db.define('restaurant', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  index: Sequelize.INTEGER,
  name: Sequelize.STRING,
  address: Sequelize.STRING,
  city: Sequelize.STRING,
  zipcode: Sequelize.STRING,
  phone: Sequelize.STRING,
  priceRange: Sequelize.INTEGER,
  stars: Sequelize.INTEGER,
  tags: Sequelize.STRING
}, {
  indexes: [
    {
      unique: true,
      fields: ['id']
    }
  ]
});


//Relationship between User & Query
User.hasMany(Query);
Query.belongsTo(User);

//Relationship between Query & List
List.hasOne(Query);
Query.belongsTo(List);

//Relationship between Restaurant & List
Restaurant.hasMany(List);
List.belongsTo(Restaurant);

User.sync()
  .then(() => Restaurant.sync())
  .then(() => List.sync())
  .then(() => Query.sync())
  .catch(error => console.log('error syncing data', error));

module.exports = {
//   Sequelize: Sequelize,
  db: db,
  User: User,
  Query: Query,
  List: List,
  Restaurant: Restaurant
};
