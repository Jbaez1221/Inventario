const express = require("express");
const router = express.Router();
const TicketsController = require("../controllers/tickets.controller");
const { protegerRuta } = require('../middleware/auth.middleware');

router.post("/publico/crear", TicketsController.crearTicketPublico);
router.get("/publico/estado", TicketsController.estadoTicketPublico);
router.get("/publico/buscar", TicketsController.buscarTicketsPublico);
router.get("/publico/buscar-por-dni", TicketsController.buscarTicketsPorDni);
router.get("/publico/buscar-por-codigo", TicketsController.buscarTicketPorCodigo);

router.post("/", protegerRuta, TicketsController.crearTicket);
router.get("/", protegerRuta, TicketsController.listarTickets);
router.get("/:id", protegerRuta, TicketsController.obtenerTicketPorId);
router.put("/:id/asignar", protegerRuta, TicketsController.asignarPersonal);
router.put("/:id/estado", protegerRuta, TicketsController.cambiarEstadoTicket); // Cambiar estado (en proceso, cerrado, etc)
router.get("/:id/historial", protegerRuta, TicketsController.listarHistorial);
router.post("/:id/historial", protegerRuta, TicketsController.agregarHistorial);
router.get("/empleados/sistemas", protegerRuta, TicketsController.listarEmpleadosSistemas);

module.exports = router;