const express = require("express");
const router = express.Router();
const AsignacionesController = require("../controllers/asignaciones.controller");
const { protegerRuta } = require('../middleware/auth.middleware');

router.get("/", AsignacionesController.listarAsignaciones);
router.get("/historial/:equipo_id", AsignacionesController.obtenerHistorialPorEquipo);



router.put("/:id/devolver", protegerRuta, AsignacionesController.devolverEquipo);
router.post("/por-dni", protegerRuta, AsignacionesController.asignarEquipoPorDNI);
router.post("/con-acta", protegerRuta, AsignacionesController.crearAsignacionYGenerarActa);

module.exports = router;
