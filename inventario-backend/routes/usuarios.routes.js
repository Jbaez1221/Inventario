const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { protegerRuta } = require('../middleware/auth.middleware');

router.get('/', protegerRuta, usuariosController.listarUsuarios);
router.post('/', protegerRuta, usuariosController.crearUsuario);
router.put('/:id', protegerRuta, usuariosController.actualizarUsuario);
router.delete('/:id', protegerRuta, usuariosController.eliminarUsuario);

module.exports = router;