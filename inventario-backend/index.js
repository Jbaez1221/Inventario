const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = require('./database');
const bcrypt = require('bcryptjs');
async function crearAdminPorDefecto() {
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  let result = await db.query("SELECT id FROM roles WHERE nombre = 'admin'");
  let rolId;
  if (result.rows.length === 0) {
    result = await db.query("INSERT INTO roles (nombre) VALUES ('admin') RETURNING id");
  }
  rolId = result.rows[0].id;
  result = await db.query("SELECT id FROM usuarios WHERE username = $1", [adminUsername]);
  if (result.rows.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.query(
      "INSERT INTO usuarios (username, password, rol_id) VALUES ($1, $2, $3)",
      [adminUsername, passwordHash, rolId]
    );
    console.log("Usuario admin creado por defecto (admin/admin123)");
  }
}
crearAdminPorDefecto();

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

const rolesRoutes = require('./routes/roles.routes');
app.use('/api/roles', rolesRoutes);

const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);

const ticketsRoutes = require("./routes/tickets.routes");
app.use("/api/tickets", ticketsRoutes);

app.get("/", (req, res) => {
  res.send("API Inventario corriendo ✅");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});