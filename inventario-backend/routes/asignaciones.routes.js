const express = require("express");
const router = express.Router();
const AsignacionesController = require("../controllers/asignaciones.controller");
const { protegerRuta } = require('../middleware/auth.middleware');

router.get("/", AsignacionesController.listarAsignaciones);
router.get("/historial/:equipo_id", AsignacionesController.obtenerHistorialPorEquipo);



router.put("/:id/devolver", protegerRuta, AsignacionesController.devolverEquipo);
router.post("/por-dni", AsignacionesController.asignarEquipoPorDNI);
router.post("/crear-con-firmas", protegerRuta, AsignacionesController.crearAsignacionConFirmas);

module.exports = router;
