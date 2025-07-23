// routes/equipos.routes.js
const express = require("express");
const router = express.Router();
const EquiposController = require("../controllers/equipos.controller");

router.get("/", EquiposController.listarEquipos);

router.post("/", EquiposController.registrarEquipo);

router.get("/disponibles", EquiposController.listarEquiposDisponibles);
router.get("/asignados", EquiposController.listarEquiposAsignados);

router.put("/:id", EquiposController.editarEquipo);

router.delete("/:id", EquiposController.eliminarEquipo);

module.exports = router;
