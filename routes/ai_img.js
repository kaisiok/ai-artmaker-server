const express = require("express");

const ai_imgController = require("../controllers/ai_img");

const router = express.Router();

router.post("/img/texttoimg", ai_imgController.postTextImg);
router.post("/img/tagtoimg",ai_imgController.postTagImg)
router.post('/img/saveimg',ai_imgController.postSaveImg)
router.get('/img/loadimg',ai_imgController.getLoadImg)
router.delete('/img/deleteimg',ai_imgController.deleteImg)

module.exports = router;
