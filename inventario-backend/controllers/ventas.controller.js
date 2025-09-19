const sapVentas = require("../services/sapVentas.service");

async function listarClientes(req, res) {
  try {
    const clientes = await sapVentas.getClientes();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listarItems(req, res) {
  try {
    const items = await sapVentas.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function nuevaOrden(req, res) {
  try {
    const orden = await sapVentas.crearOrden(req.body);
    res.json(orden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listarClientes, listarItems, nuevaOrden };
