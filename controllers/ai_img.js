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
    const imgStyle = req.body.style;

    const imgName = "testimgName";
    const userId = "1";

    const wuiSetting = {
      prompt: "masterpiece, best quality," + imgStyle + "," + imgText,
      negative_prompt:
        "(worst quality, low quality, normal quality, blur:2.0), Downcast eyes, unfocused eyes, nsfw,nude",
      seed: -1,
      subseed: -1,
      subseed_strength: 0,
      seed_resize_from_h: -1,
      seed_resize_from_w: -1,
      sampler_name: "Euler",
      batch_size: 1,
      n_iter: 1,
      steps: 15,
      cfg_scale: 7,
      width: 720,
      height: 1440,
      restore_faces: true,
    };
    if (!req.authorization) {
      return res.status(401).json({ message: "token doesn't exist" });
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
    if (!req.authorization) {
      return res.status(401).json({ message: "token doesn't exist" });
    } else {
      const imgs = await Ai_img.findAll({ where: { userId: req.user.id } }); //이미지 테이블 찾기
      if (imgs.length >= 4) {
        return res.status(406).json({ message: "too many images" }); //4장이상이면 반려
      } else {
        const currentDate = new Date();
        const timestamp =
          currentDate.getFullYear().toString() +
          (currentDate.getMonth() + 1).toString().padStart(2, "0") +
          currentDate.getDate().toString().padStart(2, "0") +
          currentDate.getHours().toString().padStart(2, "0") +
          currentDate.getMinutes().toString().padStart(2, "0") +
          currentDate.getSeconds().toString().padStart(2, "0") +
          currentDate.getMilliseconds().toString().padStart(3, "0");

        const imgdata = req.body.imgdata;
        const imgName = req.user.username + timestamp;
        base64Img.img(imgdata, "./img", imgName, (err, filepath) => {
          if (err) {
            console.error("Error saving image:", err);
            res.status(500).json({ message: "server error" });
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
    if (req.user) {
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
    } else {
      res.status(401).json({ message: "token doesn't exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.deleteImg = async (req, res, next) => {
  try {
    if (!req.authorization) {
      return res.status(401).json({ message: "token doesn't exist" });
    } else if (!req.body.imgid) {
      return res.status(406).json({ message: "invalid img id" });
    } else {
      const imgId = req.body.imgid;
      const userId = req.user.id;
      const savedImg = await Ai_img.findOne({ where: { id: imgId } });
      const imgOwnerId = savedImg.dataValues.userId;
      const imgFilePath = savedImg.dataValues.file_path;

      if (imgOwnerId !== userId) {
        return res.status(403).json({ message: "not owner of img" });
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
