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
    logging: false
  });
}

db.authenticate()
  .then(() => {
    console.log('MYSQL DB connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// //Manager Audit History Schema
// const ManagerAudit = db.define('manageraudit', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   type: Sequelize.STRING
// });

// //Manager Schema
// const Manager = db.define('manager', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   username: Sequelize.STRING,
//   passwordHash: Sequelize.STRING,
//   passwordSalt: Sequelize.STRING,
//   // restaurantId: Sequelize.INTEGER
// });

// //Customer Schema
// const Customer = db.define('customer', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: Sequelize.STRING,
//   address: Sequelize.STRING,
//   mobile: {
//     type: Sequelize.STRING,
//     unique: true,
//     allowNull: false
//   },
//   email: Sequelize.STRING
// });

// //Queue Schema
// const Queue = db.define('queue', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   size: Sequelize.INTEGER,
//   wait: {
//     type: Sequelize.INTEGER,
//     defaultValue: 0
//   },
//   position: Sequelize.INTEGER
// });

// //Restaurant Schema
// const Restaurant = db.define('restaurant', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: Sequelize.STRING,
//   address: Sequelize.STRING,
//   phone: {
//     type: Sequelize.STRING,
//     unique: true,
//     allowNull: false
//   },
//   nextPosition: {
//     type: Sequelize.INTEGER,
//     defaultValue: 0
//   },
//   'total_wait': {
//     type: Sequelize.INTEGER,
//     defaultValue: 0
//   },
//   'average_wait': {
//     type: Sequelize.INTEGER,
//     defaultValue: 0
//   },
//   status: Sequelize.STRING,

//   image: Sequelize.STRING,
//   tables: Sequelize.TEXT,
//   managerId: Sequelize.INTEGER,
//   hours: Sequelize.TEXT,
// });

// // Relationship between Restaurant & Queue
// Restaurant.hasMany(Queue);
// Queue.belongsTo(Restaurant);

// //Relationship between Customer & Queue
// Customer.hasOne(Queue);
// Queue.belongsTo(Customer);

// //Relationship between Manager & ManagerAudit
// Manager.hasOne(ManagerAudit);
// ManagerAudit.belongsTo(Manager);

// // add manager id to restaurant
// Restaurant.belongsTo(Manager);

// Customer.sync()
//   .then(() => Restaurant.sync())
//   .then(() => Queue.sync())
//   // .then(() => Manager.sync())
//   .catch(error => console.log('error syncing data', error));

module.exports = {
//   Sequelize: Sequelize,
  db: db
//   Customer: Customer,
//   Queue: Queue,
//   Restaurant: Restaurant,
//   Manager: Manager,
//   ManagerAudit: ManagerAudit
};
