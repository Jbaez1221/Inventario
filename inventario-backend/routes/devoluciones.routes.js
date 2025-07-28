const express = require('express');
const router = express.Router();
const devolucionesController = require('../controllers/devoluciones.controller');
const { protegerRuta } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/multer.config');

router.post('/:asignacion_id', protegerRuta, devolucionesController.devolverEquipoYGenerarActa);

router.post(
  '/con-firmas/:asignacion_id',
  protegerRuta,
  upload.single('imagen_salida'),
  devolucionesController.devolverEquipoConFirmas
);

module.exports = router;