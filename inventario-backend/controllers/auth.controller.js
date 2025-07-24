const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos." });
    }

    const esUsuarioValido = username === process.env.ADMIN_USER;
    const esPasswordValido = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);

    if (!esUsuarioValido || !esPasswordValido) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const payload = { user: { id: 'admin' } }; 
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = { login };