const express = require("express");
const router = express.Router();
const AsignacionesController = require("../controllers/asignaciones.controller");

router.get("/", AsignacionesController.listarAsignaciones);
router.post("/", AsignacionesController.registrarAsignacion);
router.put("/:id/devolver", AsignacionesController.devolverEquipo);
router.get("/historial/:equipo_id", AsignacionesController.obtenerHistorialPorEquipo);


// ✅ ESTA ES LA RUTA NUEVA NECESARIA
router.post("/por-dni", AsignacionesController.asignarEquipoPorDNI);

module.exports = router;
