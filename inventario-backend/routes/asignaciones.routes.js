const express = require("express");
const router = express.Router();
const AsignacionesController = require("../controllers/asignaciones.controller");
const { protegerRuta } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/multer.config');

router.get("/", AsignacionesController.listarAsignaciones);
router.get("/historial/:equipo_id", AsignacionesController.obtenerHistorialPorEquipo);

router.put("/:id/devolver", protegerRuta, AsignacionesController.devolverEquipo);
router.post("/por-dni", AsignacionesController.asignarEquipoPorDNI);
router.post(
  "/crear-con-firmas",
  protegerRuta,
  upload.single('imagen_entrada'),
  AsignacionesController.crearAsignacionConFirmas
);
router.post("/", protegerRuta, upload.single('imagen_entrada'), AsignacionesController.registrarAsignacion);

module.exports = router;
