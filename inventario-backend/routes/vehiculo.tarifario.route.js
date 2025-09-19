const express = require("express");
const router = express.Router();

const vehiculosController = require("../controllers/vehiculo.tarifario.controller.js");
const { protegerRuta, soloAdmin } = require("../middleware/auth.middleware.js");

router.get("/", vehiculosController.getVehiculos);
router.get("/:id", vehiculosController.getVehiculo);
router.get("/subida/:idSubida", vehiculosController.getVehiculosPorSubida);

router.post("/", protegerRuta, soloAdmin, vehiculosController.createVehiculo);
router.put("/:id", protegerRuta, soloAdmin, vehiculosController.updateVehiculo);
router.delete("/:id", protegerRuta, soloAdmin, vehiculosController.deleteVehiculo);

module.exports = router;
