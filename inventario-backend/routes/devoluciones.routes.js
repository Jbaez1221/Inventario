const express = require('express');
const router = express.Router();
const devolucionesController = require('../controllers/devoluciones.controller');
const { protegerRuta } = require('../middleware/auth.middleware'); // 1. Importar

router.post('/:asignacion_id', protegerRuta, devolucionesController.devolverEquipoYGenerarActa);

module.exports = router;