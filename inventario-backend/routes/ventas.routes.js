const express = require("express");
const router = express.Router();
const { protegerRuta } = require("../middleware/auth.middleware");
const ventasCtrl = require("../controllers/ventas.controller");

router.use(protegerRuta);

// Listar clientes
router.get("/clientes", ventasCtrl.listarClientes);

// Listar items
router.get("/items", ventasCtrl.listarItems);

// Crear orden de venta
router.post("/orders", ventasCtrl.nuevaOrden);

module.exports = router;
