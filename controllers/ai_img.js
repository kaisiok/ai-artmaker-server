const axios = require("axios");
const fs = require("fs");
const base64Img = require("base64-img");
const dotenv = require("dotenv");

const User = require("../models/user");
const Password = require("../models/password");
const Social_login = require("../models/soical_login");
const Ai_img = require("../models/ai_img");

const { verifyTag } = require("../util/fucntions");

dotenv.config();

exports.postTextImg = async (req, res, next) => {
  try {
    const imgText = req.body.prompt;
    const modelName = req.body.model; //모델 추가하기

    const imgName = "testimgName";
    const userId = "1";

    const wuiSetting = {
      prompt: "masterpiece, (best quality:1.1), 1girl," + imgText,
      negative_prompt: "nsfw, nude",
      seed: 1,
      steps: 20,
      width: 512,
      height: 800,
      cfg_scale: 7,
      sampler_name: "DPM++ 2M Karras",
      n_iter: 1,
      batch_size: 1,
    };
    if (!req.cookies.authorization) {
      return res.status(406).json({ message: "token doesn't exist" });
    } else {
      const imgdata = await axios.post(
        process.env.WEBUI_ADRESS + "txt2img",
        wuiSetting
      );
      res.send("data:image/png;base64," + imgdata.data.images[0]);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.postTagImg = async (req, res, next) => {
  try {
    const imgTag1 = req.body.tag1;
    const imgTag2 = req.body.tag2;
    const imgTag3 = req.body.tag3;
    const imgTag4 = req.body.tag4;
    const modelName = req.body.model; //모델 추가하기

    if (verifyTag(imgTag1, imgTag2, imgTag3, imgTag4)) {
      const wuiSetting = {
        prompt:
          "masterpiece, (best quality:1.1), 1girl," +
          imgTag1 +
          imgTag2 +
          imgTag3 +
          imgTag4,
        negative_prompt: "nsfw, nude",
        seed: 1,
        steps: 20,
        width: 512,
        height: 800,
        cfg_scale: 7,
        sampler_name: "DPM++ 2M Karras",
        n_iter: 1,
        batch_size: 1,
      };
      const imgdata = await axios.post(
        process.env.WEBUI_ADRESS + "txt2img",
        wuiSetting
      );
      res.send("data:image/png;base64," + imgdata.data.images[0]);
    } else {
      return res.status(406).json({ message: "invalid img tag" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.postSaveImg = async (req, res, next) => {
  try {
    if (!req.cookies.authorization) {
      return res.status(406).json({ message: "token doesn't exist" });
    } else {
      const imgs = await Ai_img.findAll({ where: { userId: req.user.id } }); //이미지 테이블 찾기
      if (imgs.length >= 4) {
        return res.status(406).json({ message: "too many images" }); //4장이상이면 반려
      } else {
        const imgdata = req.body.imgdata;
        const imgName = req.user.username + `${imgs.length}`;
        base64Img.img(imgdata, "./img", imgName, (err, filepath) => {
          if (err) {
            console.error("Error saving image:", err);
          } else {
            console.log("Image saved successfully at:", filepath);
            Ai_img.create({
              userId: req.user.id,
              file_name: imgName,
              file_path: filepath,
            }).then((data) => {
              res.status(200).json({ filepath, imgcount: imgs.length });
            });
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.getLoadImg = async (req, res, next) => {
  try {
    //이미지 전송할 때 id도 같이 보내기.
    const userId = req.user.id;
    const imgs = await Ai_img.findAll({ where: { userId: userId } });
    const imgArrey = [];
    for (let i = 0; i < imgs.length; i++) {
      imgArrey[i] = {
        filepath: imgs[i].dataValues.file_path,
        id: imgs[i].dataValues.id,
      };
    }
    res.status(200).json({ imgs: imgArrey });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.deleteImg = async (req, res, next) => {
  try {
    if (!req.cookies.authorization) {
      return res.status(406).json({ message: "token doesn't exist" });
    } else if (!req.body.imgid) {
      return res.status(406).json({ message: "invalid img id" });
    } else {
      const imgId = req.body.imgid;
      const userId = req.user.id;
      const savedImg = await Ai_img.findOne({ where: { id: imgId } });
      const imgOwnerId = savedImg.dataValues.userId;
      const imgFilePath = savedImg.dataValues.file_path;

      if (imgOwnerId !== userId) {
        return res.status(406).json({ message: "not owner of img" });
      } else {
        fs.unlink(imgFilePath, async (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "server error, deleted failed" });
          } else {
            await Ai_img.destroy({ where: { id: imgId } });
            res.status(200).json({ message: "img deleted" });
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};
