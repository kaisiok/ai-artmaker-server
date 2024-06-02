const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Social_login = sequelize.define("social_login", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  social_code: Sequelize.STRING,
});

module.exports = Social_login;
