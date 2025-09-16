const subidaService = require("../services/subida.tarifario.service.js");

async function getSubidas(req, res) {
  try {
    const subidas = await subidaService.obtenerSubidas();
    res.json(subidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSubida(req, res) {
  try {
    const subida = await subidaService.obtenerSubidaPorId(req.params.id);
    if (!subida) {
      return res.status(404).json({ error: "Subida no encontrada" });
    }
    res.json(subida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSubida(req, res) {
  try {
    const nuevaSubida = await subidaService.crearSubida(req.body);
    res.status(201).json(nuevaSubida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSubida(req, res) {
  try {
    const actualizada = await subidaService.actualizarSubida(
      req.params.id,
      req.body
    );
    if (!actualizada) {
      return res.status(404).json({ error: "Subida no encontrada" });
    }
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSubida(req, res) {
  try {
    const result = await subidaService.eliminarSubida(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSubidas,
  getSubida,
  createSubida,
  updateSubida,
  deleteSubida,
};
