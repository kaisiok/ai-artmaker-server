const User = require("../models/user");
const Password = require("../models/password");
const Social_login = require("../models/soical_login");

exports.postSignUp = (req, res, next) => {
  User.findAll({ where: { name: req.body.id } })
    .then((data) => {
      if (data[0]) {
        res.status(406).json({ message: "Username invalid" });
        return Error;
      } else {
        return User.create({ name: req.body.id });
      }
    })
    .then((data) => {
      const userId = data.dataValues.id;
      return Password.create({
        password: req.body.password,
        salt: "fill other salt later",
        userId: userId,
      });
    })
    .then(() => {
      res.send("hi");
    })
    .catch((err) => {
      console.log("err!", err);
    });
};
