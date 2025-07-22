// routes/equipos.routes.js
const express = require("express");
const router = express.Router();
const EquiposController = require("../controllers/equipos.controller");

// GET todos los equipos
router.get("/", EquiposController.listarEquipos);

// POST registrar nuevo equipo
router.post("/", EquiposController.registrarEquipo);

// GET disponibles / asignados
router.get("/disponibles", EquiposController.listarEquiposDisponibles);
router.get("/asignados", EquiposController.listarEquiposAsignados);

// PUT editar equipo
router.put("/:id", EquiposController.editarEquipo);

// DELETE eliminar equipo
router.delete("/:id", EquiposController.eliminarEquipo);

module.exports = router;
