const express = require("express");
const sequelize = require("./util/database");

const User = require("./models/user");
const Password = require("./models/password");
const Social_login = require("./models/soical_login");
const Ai_img = require("./models/ai_img");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

User.hasOne(Password);
User.hasOne(Social_login);
User.hasMany(Ai_img);

sequelize
  .sync()
  .then((result) => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
