const UsuariosModel = require('../models/usuarios.model');

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await UsuariosModel.obtenerUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { username, password, rol_id } = req.body;
    const usuario = await UsuariosModel.crearUsuario({ username, password, rol_id });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, rol_id } = req.body;
    const usuario = await UsuariosModel.actualizarUsuario(id, { username, password, rol_id });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await UsuariosModel.eliminarUsuario(id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};