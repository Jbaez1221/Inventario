const express = require("express");
const router = express.Router();

const subidaController = require("../controllers/subida.tarifario.controller.js");
const { protegerRuta, soloAdmin } = require("../middleware/auth.middleware.js");

router.get("/", subidaController.getSubidas);
router.get("/:id", subidaController.getSubida);
router.post("/", protegerRuta, soloAdmin, subidaController.createSubida);
router.put("/:id", protegerRuta, soloAdmin, subidaController.updateSubida);
router.delete("/:id", protegerRuta, soloAdmin, subidaController.deleteSubida);

module.exports = router;
