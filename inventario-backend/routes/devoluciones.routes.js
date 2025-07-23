const express = require('express');
const router = express.Router();
const devolucionesController = require('../controllers/devoluciones.controller');

router.post('/:asignacion_id', devolucionesController.devolverEquipoYGenerarActa);

module.exports = router;