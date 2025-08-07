const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { protegerRuta, soloAdmin } = require('../middleware/auth.middleware');

router.get('/', protegerRuta, rolesController.listarRoles);
router.post('/', protegerRuta, soloAdmin, rolesController.crearRol);
router.put('/:id', protegerRuta, soloAdmin, rolesController.actualizarRol);
router.delete('/:id', protegerRuta, soloAdmin, rolesController.eliminarRol);

module.exports = router;