const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const config = require('../../config/server');

//Create an empty object which can store our databases
const db = {};

//Extract the database information into an array
const databases = Object.keys(config.development.databases);
// console.log('TCL: databases', databases);

for (let i = 0; i < databases.length; ++i) {
  let database = databases[i];
  let dbPath = config.development.databases[database];
  db[database] = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
}

fs.readdirSync(__dirname + '/models')
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = db.realworld['import'](path.join(__dirname + '/models', file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
