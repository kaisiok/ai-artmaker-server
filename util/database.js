const Sequelize = require('sequelize');
const dotenv = require("dotenv");

dotenv.config();


const sequelize = new Sequelize('aiartdb', 'root', process.env.DB_PASSWORD, {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
