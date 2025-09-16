const tipoService = require("../services/tipomantenimiento.tarifario.service.js");

async function getTipos(req, res) {
    try {
        const tipos = await tipoService.obtenerTipos();
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getTipo(req, res) {
    try {
        const tipo = await tipoService.obtenerTipoPorId(req.params.id);
        if (!tipo) return res.status(404).json({ error: "Tipo no encontrado" });
        res.json(tipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createTipo(req, res) {
    try {
        const nuevo = await tipoService.crearTipo(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateTipo(req, res) {
    try {
        const actualizado = await tipoService.actualizarTipo(req.params.id, req.body);
        if (!actualizado) return res.status(404).json({ error: "Tipo no encontrado" });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteTipo(req, res) {
    try {
        const result = await tipoService.eliminarTipo(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getTipos, getTipo, createTipo, updateTipo, deleteTipo };
