const axios = require("axios");
const bcrypt = require("bcrypt");
const qs = require("qs");
const fs = require("fs");
const dotenv = require("dotenv");
const crypto = require("crypto");

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
      await transaction.rollback();
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
      if (req.body.social === "") {
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
              await transaction.rollback();
              res.status(406).json({ message: "Password invalid" });
            }
          }
        );
      } else {
        const access_tokenValue = await Social_login.findOne({
          where: { userId: req.user.id },
        });

        const access_token = access_tokenValue.dataValues.access_token;
        const url = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${process.env.OAUTH_NAVER_CLIENT_ID}&client_secret=${process.env.OAUTH_NAVER_CLIENT_SECRET}&access_token=${access_token}&service_provider=NAVER`;

        const response = await axios.delete(url);

        if (response.data.result === "success") {
          const imgfiles = await Ai_img.findAll({
            where: { userId: req.user.id },
          });
          for (let i = 0; i < imgfiles.length; i++) {
            fs.unlinkSync(imgfiles[i].dataValues.file_path);
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
          await transaction.rollback();
          res.status(500).json({ message: "server error" });
        }
      }
    } else {
      await transaction.rollback();
      res.status(401).json({ message: "token doesn't exist" });
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
            res.status(406).json({ message: "invalid password" });
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
    if (req.authorization) {
      res
        .cookie("authorization", "", {
          httpOnly: true,
          sameSite: "none",
          expires: new Date(0),
          secure: true,
        })
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
    if (req.authorization) {
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
      res.status(401).json({ message: "invalid token" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.getCheckId = async (req, res, next) => {
  try {
    const userId = req.query.id;
    if (!userId) {
      req.status(400).json({ message: "empty id query" });
    } else {
      const duplicatedUser = await User.findAll({
        where: { name: userId },
      });
      if (duplicatedUser[0]) {
        res.status(409).json({ message: "UserId already exists" });
      } else {
        res.status(200).json({ message: "ok" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.OAuthNaverLogin = async (req, res, next) => {
  try {
    const state = crypto.randomBytes(16).toString("hex"); // State 값 생성
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${
      process.env.OAUTH_NAVER_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.CLIENT_DOMAIN + "/oauth"
    )}&state=${state}`;

    res.json({ authUrl: naverAuthUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.OAuthNaverCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    const tokenResponse = await axios.post(
      "https://nid.naver.com/oauth2.0/token",
      qs.stringify({
        grant_type: "authorization_code",
        client_id: process.env.OAUTH_NAVER_CLIENT_ID,
        client_secret: process.env.OAUTH_NAVER_CLIENT_SECRET,
        code,
        state,
      })
    );

    const { access_token } = tokenResponse.data;

    const profileResponse = await axios.get(
      "https://openapi.naver.com/v1/nid/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (profileResponse.data.resultcode === "00") {
      const { id: naverId, name: naverName } = profileResponse.data.response;
      const userId = await User.findOne({ where: { name: naverId } });
      if (userId) {
        const token = generateToken({
          id: userId.dataValues.id,
          username: naverName,
        });

        const loginedUser = await Social_login.findOne({
          where: { userId: userId.dataValues.id },
        });
        await loginedUser.update({ access_token: access_token });

        res
          .cookie("authorization", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .status(200)
          .json({
            message: "login completed",
            username: naverName,
          });
      } else {
        const userCreate = await User.create({ name: naverId });
        const userIdCreated = userCreate.dataValues.id;
        await Social_login.create({
          social_code: "naver",
          access_token: access_token,
          userId: userIdCreated,
        });
        const token = generateToken({
          id: userIdCreated,
          username: naverName,
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
            username: naverName,
          });
      }
    } else {
      res.status(500).json({
        message:
          profileResponse.data.resultcode + "/" + profileResponse.data.message,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};
