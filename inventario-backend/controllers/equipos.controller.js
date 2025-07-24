const EquipoModel = require("../models/equipos.model");

const listarEquipos = async (req, res) => {
  try {
    const equipos = await EquipoModel.obtenerEquipos();
    res.status(200).json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    res.status(500).json({ error: "Error al obtener equipos" });
  }
};

const registrarEquipo = async (req, res) => {
  try {
    const equipoData = req.body;
    
    if (req.file) {
      equipoData.equipo_url = `/uploads/${req.file.filename}`;
    }

    const nuevo = await EquipoModel.crearEquipo(equipoData);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al registrar equipo:", error);
    res.status(500).json({ error: "Error al crear equipo", detalle: error.message });
  }
};

const listarEquiposDisponibles = async (req, res) => {
  try {
    const equipos = await EquipoModel.obtenerEquiposDisponibles();
    res.status(200).json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos disponibles:", error);
    res.status(500).json({ error: "Error al obtener equipos disponibles" });
  }
};

const listarEquiposAsignados = async (req, res) => {
  try {
    const equipos = await EquipoModel.obtenerEquiposAsignados();
    res.status(200).json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos asignados:", error);
    res.status(500).json({ error: "Error al obtener equipos asignados" });
  }
};

const editarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const equipoData = req.body;

    if (req.file) {
      equipoData.equipo_url = `/uploads/${req.file.filename}`;
    }

    const actualizado = await EquipoModel.actualizarEquipo(id, equipoData);
    res.status(200).json(actualizado);
  } catch (error) {
    console.error("Error al editar equipo:", error);
    res.status(500).json({ error: "Error al editar equipo", detalle: error.message });
  }
};

const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    await EquipoModel.eliminarEquipo(id);
    res.status(200).json({ mensaje: "Equipo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar equipo:", error);
    res.status(500).json({ error: "Error al eliminar equipo", detalle: error.message });
  }
};

module.exports = {
  listarEquipos,
  registrarEquipo,
  listarEquiposDisponibles,
  listarEquiposAsignados,
  editarEquipo,
  eliminarEquipo
};
