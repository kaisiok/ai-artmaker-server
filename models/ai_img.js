const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Ai_img = sequelize.define("ai_img", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  file_name: Sequelize.STRING,
  file_path: Sequelize.STRING,
});

module.exports = Ai_img;
