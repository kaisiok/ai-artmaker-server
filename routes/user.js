const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/user/signup", userController.postSignUp);
router.post("/user/login", userController.postLogin);
router.post("/user/logout", userController.postLogout);
router.delete("/user/delete/userinfo", userController.deleteUserInfo);
router.get("/user/checkid", userController.getCheckId);
router.put("/user/change/password", userController.putChangePassword);
router.get("/user/login/oauthnaver", userController.OAuthNaverLogin);
router.get("/user/login/navercallback", userController.OAuthNaverCallback);

module.exports = router;
