const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos." });
    }

    const result = await db.query(`
      SELECT u.*, r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.username = $1
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const usuario = result.rows[0];

    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const payload = { 
      user: { 
        id: usuario.id, 
        username: usuario.username, 
        rol: usuario.rol,
        empleado_id: usuario.empleado_id
      } 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = { login };