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
    return next();
  }
  jwt.verify(token, process.env.TOKEN_SALT, (err, decoded) => {
    if (err) {
      req.authorization = false;
    } else {
      req.authorization = true;
      req.user = decoded;
    }
    next();
  });
};