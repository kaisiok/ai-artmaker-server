const express = require("express");

const ai_imgController = require("../controllers/ai_img");

const router = express.Router();

router.post("/img/texttoimg", ai_imgController.postTextImg);

module.exports = router;