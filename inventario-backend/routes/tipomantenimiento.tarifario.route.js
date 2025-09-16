const express = require("express");
const router = express.Router();
const tipoController = require("../controllers/tipomantenimiento.tarifario.controller.js");
const { protegerRuta, soloAdmin } = require("../middleware/auth.middleware.js");

router.get("/", tipoController.getTipos);
router.get("/:id", tipoController.getTipo);
router.post("/", protegerRuta, soloAdmin, tipoController.createTipo);
router.put("/:id", protegerRuta, soloAdmin, tipoController.updateTipo);
router.delete("/:id", protegerRuta, soloAdmin, tipoController.deleteTipo);

module.exports = router;
