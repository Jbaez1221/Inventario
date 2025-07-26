const express = require('express');
const router = express.Router();
const devolucionesController = require('../controllers/devoluciones.controller');
const { protegerRuta } = require('../middleware/auth.middleware');

// Ruta antigua (si la quieres mantener para devoluciones sin firma)
router.post('/:asignacion_id', protegerRuta, devolucionesController.devolverEquipoYGenerarActa);

// 1. Añadir la nueva ruta para devoluciones con firmas
router.post('/con-firmas/:asignacion_id', protegerRuta, devolucionesController.devolverEquipoConFirmas);

module.exports = router;