const express = require("express");
const router = express.Router();
const EquiposController = require("../controllers/equipos.controller");
const { protegerRuta } = require('../middleware/auth.middleware'); // 1. Importar

router.get("/", EquiposController.listarEquipos);
router.get("/disponibles", EquiposController.listarEquiposDisponibles);
router.get("/asignados", EquiposController.listarEquiposAsignados);

router.post("/", protegerRuta, EquiposController.registrarEquipo);
router.put("/:id", protegerRuta, EquiposController.editarEquipo);
router.delete("/:id", protegerRuta, EquiposController.eliminarEquipo);

module.exports = router;
