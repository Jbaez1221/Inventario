// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const equiposRoutes = require("./routes/equipos.routes");
app.use("/api/equipos", equiposRoutes);

const empleadosRoutes = require("./routes/empleados.routes");
app.use("/api/empleados", empleadosRoutes);

const asignacionesRoutes = require("./routes/asignaciones.routes");
app.use("/api/asignaciones", asignacionesRoutes);



// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API Inventario corriendo ✅");
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:4002`);
});

