const express = require("express");
const router = express.Router();
const EmpleadosController = require("../controllers/empleados.controller");
const { protegerRuta } = require('../middleware/auth.middleware'); // 1. Importar

router.get("/", EmpleadosController.listarEmpleados);
router.get("/por-dni/:dni", EmpleadosController.obtenerEmpleadoPorDNI);

router.post("/", protegerRuta, EmpleadosController.registrarEmpleado);
router.put("/:id", protegerRuta, EmpleadosController.actualizarEmpleado);
router.delete("/:id", protegerRuta, EmpleadosController.eliminarEmpleado);

module.exports = router;
