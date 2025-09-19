// controllers/modeloController.js
const modeloService = require("../services/modelo.tarifario.service.js");

async function getModelos(req, res) {
  try {
    const modelos = await modeloService.obtenerModelos();
    res.json(modelos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getModelo(req, res) {
  try {
    const modelo = await modeloService.obtenerModeloPorId(req.params.id);
    if (!modelo) {
      return res.status(404).json({ error: "Modelo no encontrado" });
    }
    res.json(modelo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getModelosPorVehiculo(req, res) {
  try {
    const idVehiculo = parseInt(req.params.idVehiculo, 10);
    if (isNaN(idVehiculo)) {
      return res
        .status(400)
        .json({ error: "El parámetro idVehiculo debe ser un número válido." });
    }
    const modelos = await modeloService.obtenerModelosPorVehiculo(idVehiculo);
    res.json(modelos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createModelo(req, res) {
  try {
    const nuevoModelo = await modeloService.crearModelo(req.body);
    res.status(201).json(nuevoModelo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateModelo(req, res) {
  try {
    const actualizado = await modeloService.actualizarModelo(
      req.params.id,
      req.body
    );
    if (!actualizado) {
      return res.status(404).json({ error: "Modelo no encontrado" });
    }
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteModelo(req, res) {
  try {
    const result = await modeloService.eliminarModelo(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getModelos,
  getModelo,
  getModelosPorVehiculo,
  createModelo,
  updateModelo,
  deleteModelo,
};
