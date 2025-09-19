const mantService = require("../services/mantenimiento.tarfario.service.js");

async function getMantenimientos(req, res) {
    try {
        const datos = await mantService.obtenerMantenimientos();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMantenimiento(req, res) {
    try {
        const dato = await mantService.obtenerMantenimientoPorId(req.params.id);
        if (!dato) return res.status(404).json({ error: "Mantenimiento no encontrado" });
        res.json(dato);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createMantenimiento(req, res) {
    try {
        const nuevo = await mantService.crearMantenimiento(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateMantenimiento(req, res) {
    try {
        const actualizado = await mantService.actualizarMantenimiento(req.params.id, req.body);
        if (!actualizado) return res.status(404).json({ error: "Mantenimiento no encontrado" });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteMantenimiento(req, res) {
    try {
        const result = await mantService.eliminarMantenimiento(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getMantenimientos, getMantenimiento, createMantenimiento, updateMantenimiento, deleteMantenimiento };
