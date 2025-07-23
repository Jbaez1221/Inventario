const express = require("express");
const router = express.Router();
const AsignacionesController = require("../controllers/asignaciones.controller");

router.get("/", AsignacionesController.listarAsignaciones);
// router.post("/", AsignacionesController.registrarAsignacion); // <- Esta es la original
router.put("/:id/devolver", AsignacionesController.devolverEquipo);
router.get("/historial/:equipo_id", AsignacionesController.obtenerHistorialPorEquipo);

// ✅ ESTA ES LA RUTA NUEVA NECESARIA
router.post("/por-dni", AsignacionesController.asignarEquipoPorDNI);

// Ruta para crear una asignación y generar el acta (URL corregida)
router.post("/con-acta", AsignacionesController.crearAsignacionYGenerarActa);

module.exports = router;
