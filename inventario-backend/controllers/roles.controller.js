const RolesModel = require('../models/roles.model');

const listarRoles = async (req, res) => {
  try {
    const roles = await RolesModel.obtenerRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar roles' });
  }
};

const crearRol = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre del rol es requerido.' });
    const rol = await RolesModel.crearRol(nombre);
    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

const actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre del rol es requerido.' });
    const rol = await RolesModel.actualizarRol(id, nombre);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

const eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;
    await RolesModel.eliminarRol(id);
    res.json({ mensaje: 'Rol eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};

module.exports = {
  listarRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
};