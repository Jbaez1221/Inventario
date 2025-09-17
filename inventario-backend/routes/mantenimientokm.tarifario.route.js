const express = require("express");
const router = express.Router();

const mantKmController = require("../controllers/mantenimientokm.tarifario.controller.js");
const { protegerRuta, soloAdmin } = require("../middleware/auth.middleware.js");

// 🔹 Rutas CRUD para MantenimientoKm
router.get("/", mantKmController.getMantenimientosKm);
router.get("/modelo/:idModelo", mantKmController.getTarifarioPorModelo);
router.get("/:id", mantKmController.getMantenimientoKm);


router.post("/", protegerRuta, soloAdmin, mantKmController.createMantenimientoKm);
router.put("/:id", protegerRuta, soloAdmin, mantKmController.updateMantenimientoKm);
router.delete("/:id", protegerRuta, soloAdmin, mantKmController.deleteMantenimientoKm);


module.exports = router;
