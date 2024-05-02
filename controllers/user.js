const bcrypt = require("bcrypt");
const fs = require("fs");

const sequelize = require("../util/database");

const User = require("../models/user");
const Password = require("../models/password");
const Social_login = require("../models/soical_login");
const Ai_img = require("../models/ai_img");

const { generateToken } = require("../util/fucntions");

exports.postSignUp = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const duplicatedUser = await User.findAll({ where: { name: req.body.id } });
    if (duplicatedUser[0]) {
      res.status(406).json({ message: "invalid userid" });
    } else {
      const userCreate = await User.create(
        { name: req.body.id },
        { transaction: transaction }
      );
      const userId = userCreate.dataValues.id;
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await Password.create(
        {
          password: hashedPassword,
          userId: userId,
        },
        { transaction: transaction }
      );
      await transaction.commit();
      res.status(200).json({ message: "sing up completed" });
    }
  } catch (err) {
    console.log(err);
    if (transaction) {
      await transaction.rollback();
      console.log("rollback");
    }
    res.status(500).json({ message: "server error" });
  }
};

exports.deleteUserInfo = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    if (req.authorization) {
      const hashedPassword = await Password.findOne({
        where: { userId: req.user.id },
      });
      bcrypt.compare(
        req.body.password,
        hashedPassword.dataValues.password,
        async (err, result) => {
          if (result) {
            try {
              const imgfiles = await Ai_img.findAll({
                where: { userId: req.user.id },
              });
              for (let i = 0; i < imgfiles.length; i++) {
                fs.unlinkSync(imgfiles[i].dataValues.file_path);
              }
            } catch (err) {
              console.log(err);
              return res
                .status(500)
                .json({ message: "server error, img delete fail" });
            }

            await User.destroy(
              {
                where: { id: req.user.id },
                cascade: true,
              },
              { transaction: transaction }
            );
            await transaction.commit();

            res
              .cookie("authorization", "", {
                httpOnly: true,
                expires: new Date(0),
              })
              .status(200)
              .json({ message: "delete userInfo completed" });
          } else {
            res.status(406).json({ message: "Password invalid" });
          }
        }
      );
    } else {
      res.status(406).json({ message: "token doesn't exist" });
    }
  } catch (err) {
    console.log(err);
    if (transaction) {
      await transaction.rollback();
      console.log("rollback");
    }
    res.status(500).json({ message: "server error" });
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const userId = await User.findOne({ where: { name: req.body.id } });
    if (userId) {
      const hashedPassword = await Password.findOne({
        where: { userId: userId.dataValues.id },
      });
      bcrypt.compare(
        req.body.password,
        hashedPassword.dataValues.password,
        (err, result) => {
          if (result) {
            const token = generateToken({
              id: userId.dataValues.id,
              username: userId.dataValues.name,
            });
            res
              .cookie("authorization", token, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
              })
              .status(200)
              .json({
                message: "login completed",
                username: userId.dataValues.name,
              });
          } else {
            res.status(406).json({ message: "invalid password " });
          }
        }
      );
    } else {
      res.status(406).json({ message: "user id doesn't exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    if (req.cookies.authorization) {
      res
        .cookie("authorization", "", { httpOnly: true, expires: new Date(0) })
        .status(200)
        .json({ message: "logout completed" });
    } else {
      res.status(406).json({ message: "token doesn't exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.putChangePassword = async (req, res, next) => {
  try {
    if (req.cookies.authorization) {
      const userId = req.user.id;
      const lastPassword = req.body.lastPassword;
      const newPassword = req.body.newPassword;
      if (lastPassword && newPassword) {
        const hashedPassword = await Password.findOne({
          where: { userId: userId },
        });
        bcrypt.compare(
          lastPassword,
          hashedPassword.dataValues.password,
          async (err, result) => {
            if (result) {
              const newHashedPassword = await bcrypt.hash(newPassword, 10);
              await hashedPassword.update({ password: newHashedPassword });
              res.status(200).json({ message: "password changed" });
            } else {
              res.status(406).json({ message: "invalid password" });
            }
          }
        );
      } else {
        res.status(406).json({ message: "invalid request" });
      }
    } else {
      res.status(406).json({ message: "invalid token" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.getCheckId = async (req, res, next) => {
  try {
    const duplicatedUser = await User.findAll({ where: { name: req.body.id } });
    if (duplicatedUser[0]) {
      res.status(200).json({ message: "has duplicated user id" });
    } else {
      res.status(200).json({ message: "ok" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};
