const express = require("express");
const router = express.Router();
const sapService = require("../services/SapService");
const { protegerRuta } = require("../middleware/auth.middleware");

// Proteger todas las rutas SAP con JWT
router.use(protegerRuta);

// Test login SAP
router.get("/login", async (req, res) => {
  try {
    await sapService.login();
    res.json({ message: "Conectado a SAP correctamente ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Traer Items de SAP
router.get("/items", async (req, res) => {
  try {
    const items = await sapService.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
