const express = require("express");
const router = express.Router();
const AsignacionesController = require("../controllers/asignaciones.controller");

router.get("/", AsignacionesController.listarAsignaciones);
router.put("/:id/devolver", AsignacionesController.devolverEquipo);
router.get("/historial/:equipo_id", AsignacionesController.obtenerHistorialPorEquipo);

router.post("/por-dni", AsignacionesController.asignarEquipoPorDNI);

router.post("/con-acta", AsignacionesController.crearAsignacionYGenerarActa);

module.exports = router;
