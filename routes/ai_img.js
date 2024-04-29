const express = require("express");

const ai_imgController = require("../controllers/ai_img");

const router = express.Router();

router.get("/img/texttoimg", ai_imgController.getTextImg);

module.exports = router;
