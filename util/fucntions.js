const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.generateToken = (user) => {
  const token = jwt.sign(user, process.env.TOKEN_SALT, { expiresIn: "1h" });
  return token;
};

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.authorization;
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
  const imgCodeList = imgCode.split("/");
  function isValidPattern(str) {
    const regex = /^(00[1-9]|0[1-2]\d|03[0-6])$/;
    return regex.test(str);
  }

  const isValidList = imgCodeList.reduce((accumulator, currentValue) => {
    return accumulator === isValidPattern(currentValue);
  }, true);

  if (isValidList) {
    const prompt = {
      "001": "",
      "002": "",
      "003": "",
      "004": "",
      "005": "",
      "006": "",
      "007": "",
      "008": "",
      "009": "",
      "010": "",
      "011": "",
      "012": "",
      "013": "",
      "014": "",
      "015": "",
      "016": "",
      "017": "",
      "018": "",
      "019": "",
      "020": "",
      "021": "",
      "022": "",
      "023": "",
      "024": "",
      "025": "",
      "026": "",
      "027": "",
      "028": "",
      "029": "",
      "030": "",
      "031": "",
      "032": "",
      "033": "",
      "034": "",
      "035": "",
      "036": "",
    };
    let promptString = "";
    for (let i = 1; i < imgCodeList.length; i++) {
      promptString = promptString + "," + prompt[imgCodeList[i]];
    }
    return promptString.slice(1);
  } else {
    return false;
  }
};
