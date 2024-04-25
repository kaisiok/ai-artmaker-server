const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Password = sequelize.define("password", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  salt: Sequelize.STRING,
  passowrd: Sequelize.STRING,
});

module.exports = Password;