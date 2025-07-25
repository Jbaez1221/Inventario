const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudes.controller');

router.get('/', controller.getSolicitudes);
router.post('/', controller.crearSolicitud);
router.put('/:id/estado', controller.cambiarEstado);

module.exports = router;
