const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const equiposRoutes = require("./routes/equipos.routes");
app.use("/api/equipos", equiposRoutes);

const empleadosRoutes = require("./routes/empleados.routes");
app.use("/api/empleados", empleadosRoutes);

const asignacionesRoutes = require("./routes/asignaciones.routes");
app.use("/api/asignaciones", asignacionesRoutes);

const devolucionesRoutes = require('./routes/devoluciones.routes');
app.use('/api/devoluciones', devolucionesRoutes);

const solicitudesRoutes = require ('./routes/solicitudes.routes');
app.use('/api/solicitudes', solicitudesRoutes);



app.get("/", (req, res) => {
  res.send("API Inventario corriendo ✅");
});

app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:4002');
});