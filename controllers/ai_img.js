const axios = require("axios");
const fs = require("fs");
const base64Img = require("base64-img");
const dotenv = require("dotenv");

const User = require("../models/user");
const Password = require("../models/password");
const Social_login = require("../models/soical_login");
const Ai_img = require("../models/ai_img");

dotenv.config();

exports.getTextImg = async (req, res, next) => {
  const imgText = req.body.prompt;
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
    try {
      const imgdata = await axios.post(
        process.env.WEBUI_ADRESS + "txt2img",
        wuiSetting
      );
      res.send("data:image/png;base64," + imgdata.data.images[0]);

      // 이미지 저장 코드
      // base64Img.img("data:image/png;base64," + imgdata.data.images[0], "./img", imgName, (err, filepath) => {
      //     if (err) {
      //         console.error('Error saving image:', err);
      //     } else {
      //         console.log('Image saved successfully at:', filepath);
      //         Ai_img.create({
      //             userId:userId,
      //             file_name:imgName,
      //             file_path:filepath
      //         })
      //         .then((data)=>{
      //             res.send(filepath)
      //         })
      //     }
      // });
    } catch (err) {
      console.log(err);
    }
  }
};

exports.getTagImg = async (res, req, next) => {};

exports.postSaveImg = async (res, req, next) => {};

exports.getLoadImg = async (res, req, next) => {};

exports.deleteImg = async (res, req, next) => {};
