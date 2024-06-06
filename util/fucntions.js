const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.generateToken = (user) => {
  const token = jwt.sign(user, process.env.TOKEN_SALT, { expiresIn: "3h" });
  return token;
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    req.authorization = false;
    next();
  } else {
    jwt.verify(token, process.env.TOKEN_SALT, (err, decoded) => {
      if (err) {
        req.authorization = false;
      } else {
        req.authorization = true;
        req.user = decoded;
      }
      next();
    });
  }
};

exports.verifyTag = (imgCode) => {
  const imgCodeList = imgCode.slice(1).split("/");
  function isValidPattern(str) {
    const regex = /^(00[1-9]|0[1-2]\d|03[0-6])$/;
    return regex.test(str);
  }

  const isValidList = imgCodeList.reduce((accumulator, currentValue) => {
    return accumulator === isValidPattern(currentValue);
  }, true);

  if (isValidList) {
    const prompt = {
      "001": "charcoal drawing, <lora:EldritchCharcoalXL1.1:1>",
      "002": "<lora:EldritchImpressionismXL1.5:1>",
      "003": "<lora:EldritchComicsXL1.2:1>",
      "004": "<lora:InkArtXL_1.2:1>",
      "005": "background, scenery",
      "006": "one girl,full body",
      "007": "one guy,full body",
      "008": "animal",
      "009": "looking at viewer",
      "010": "looking back",
      "011": "from side",
      "012": "sitting",
      "013": "looking at viewer",
      "014": "looking back",
      "015": "from side",
      "016": "sitting",
      "017": "smile,adult",
      "018": "serious",
      "019": "angry, <lora:angryXL:0.7>",
      "020": "crying with tears <lora:tearsXL:0.7> ",
      "021": "smile,adult",
      "022": "serious",
      "023": "angry, <lora:angryXL:0.7>",
      "024": "crying with tears <lora:tearsXL:0.7>",
      "025": "morning",
      "026": "noon, sun",
      "027": "sunset",
      "028": "night",
      "029": "beach",
      "030": "lake",
      "031": "mountain",
      "032": "city",
      "033": "dog",
      "034": "cat",
      "035": "eagle",
      "036": "tiger",
    };
    let promptString = "";
    for (let i = 0; i < imgCodeList.length; i++) {
      promptString = promptString + "," + prompt[imgCodeList[i]];
    }
    return promptString.slice(1);
  } else {
    return false;
  }
};

exports.getStyleFromCode = (code) => {
  let result;
  if (code === "001") {
    result = "charcoal drawing, <lora:EldritchCharcoalXL1.1:1>";
  } else if (code === "002") {
    result = "<lora:EldritchImpressionismXL1.5:1>";
  } else if (code === "003") {
    result = "<lora:EldritchComicsXL1.2:1>";
  } else if (code === "004") {
    result = "<lora:InkArtXL_1.2:1>";
  } else {
    result = "";
  }
  return result;
};
