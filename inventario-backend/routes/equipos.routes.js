const express = require("express");
const router = express.Router();
const EquiposController = require("../controllers/equipos.controller");
const { protegerRuta } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.config');

router.get("/", EquiposController.listarEquipos);
router.get("/disponibles", EquiposController.listarEquiposDisponibles);
router.get("/asignados", EquiposController.listarEquiposAsignados);

router.post("/", protegerRuta, upload.single('imagen'), EquiposController.registrarEquipo);
router.put("/:id", protegerRuta, upload.single('imagen'), EquiposController.editarEquipo);

router.delete("/:id", protegerRuta, EquiposController.eliminarEquipo);

module.exports = router;
