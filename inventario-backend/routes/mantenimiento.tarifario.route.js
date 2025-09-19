const express = require("express");
const router = express.Router();

const mantenimientoController = require("../controllers/mantenimiento.tarifario.controller.js");
const { protegerRuta, soloAdmin } = require("../middleware/auth.middleware.js");

// 🔹 Rutas CRUD para Mantenimiento
router.get("/", mantenimientoController.getMantenimientos);
router.get("/:id", mantenimientoController.getMantenimiento);

router.post("/", protegerRuta, soloAdmin, mantenimientoController.createMantenimiento);
router.put("/:id", protegerRuta, soloAdmin, mantenimientoController.updateMantenimiento);
router.delete("/:id", protegerRuta, soloAdmin, mantenimientoController.deleteMantenimiento);

module.exports = router;
