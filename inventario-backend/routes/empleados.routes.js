const express = require("express");
const router = express.Router();
const EmpleadosController = require("../controllers/empleados.controller");

router.get("/", EmpleadosController.listarEmpleados);
router.post("/", EmpleadosController.registrarEmpleado);
router.put("/:id", EmpleadosController.actualizarEmpleado);
router.delete("/:id", EmpleadosController.eliminarEmpleado);
router.get("/por-dni/:dni", EmpleadosController.obtenerEmpleadoPorDNI);



module.exports = router;
