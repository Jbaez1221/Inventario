const express = require("express");
const router = express.Router();

const modeloController = require("../controllers/modelo.tarifario.controller.js");
const { protegerRuta, soloAdmin } = require("../middleware/auth.middleware.js");

router.get("/vehiculo/:idVehiculo", modeloController.getModelosPorVehiculo);
router.get("/", modeloController.getModelos);
router.get("/:id", modeloController.getModelo);

router.post("/", protegerRuta, soloAdmin, modeloController.createModelo);
router.put("/:id", protegerRuta, soloAdmin, modeloController.updateModelo);
router.delete("/:id", protegerRuta, soloAdmin, modeloController.deleteModelo);

module.exports = router;
