const jwt = require('jsonwebtoken');

const protegerRuta = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado o con formato incorrecto.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token no válido o expirado.' });
  }
};

module.exports = { protegerRuta };