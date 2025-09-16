const mantKmService = require("../services/mantenimientokm.tarifario.service.js");

async function getMantenimientosKm(req, res) {
  try {
    const datos = await mantKmService.obtenerMantenimientosKm();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMantenimientoKm(req, res) {
  try {
    const dato = await mantKmService.obtenerMantenimientoKmPorId(req.params.id);
    if (!dato) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(dato);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createMantenimientoKm(req, res) {
  try {
    const nuevo = await mantKmService.crearMantenimientoKm(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateMantenimientoKm(req, res) {
  try {
    const actualizado = await mantKmService.actualizarMantenimientoKm(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteMantenimientoKm(req, res) {
  try {
    const result = await mantKmService.eliminarMantenimientoKm(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTarifarioPorModelo(req, res) {
  try {
    const idModelo = parseInt(req.params.idModelo, 10);
    if (isNaN(idModelo)) {
      return res.status(400).json({ error: "idModelo inválido" });
    }
    const data = await mantKmService.obtenerTarifarioPorModelo(idModelo);
    if (!data) return res.status(404).json({ error: "Modelo no encontrado" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor", detail: error.message });
  }
}

module.exports = { getMantenimientosKm, getMantenimientoKm, createMantenimientoKm, updateMantenimientoKm, deleteMantenimientoKm, getTarifarioPorModelo };
