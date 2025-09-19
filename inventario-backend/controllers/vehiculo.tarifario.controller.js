const vehiculosService = require("../services/vehiculos.tarifario.service.js");

async function getVehiculos(req, res) {
  try {
    const vehiculos = await vehiculosService.obtenerVehiculos();
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getVehiculo(req, res) {
  try {
    const vehiculo = await vehiculosService.obtenerVehiculoPorId(req.params.id);
    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getVehiculosPorSubida(req, res) {
  try {
    const idSubida = parseInt(req.params.idSubida, 10);
    if (isNaN(idSubida)) {
      return res.status(400).json({ error: "El parámetro idSubida debe ser un número válido." });
    }
    const vehiculos = await vehiculosService.obtenerVehiculosPorSubida(idSubida);
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createVehiculo(req, res) {
  try {
    const nuevoVehiculo = await vehiculosService.crearVehiculo(req.body);
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateVehiculo(req, res) {
  try {
    const actualizado = await vehiculosService.actualizarVehiculo(
      req.params.id,
      req.body
    );
    if (!actualizado) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteVehiculo(req, res) {
  try {
    const result = await vehiculosService.eliminarVehiculo(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getVehiculos,
  getVehiculo,
  getVehiculosPorSubida,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
};
