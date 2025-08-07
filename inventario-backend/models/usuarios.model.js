const db = require('../database');
const bcrypt = require('bcryptjs');

const crearUsuario = async ({ username, password, rol_id }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO usuarios (username, password, rol_id) VALUES ($1, $2, $3) RETURNING *`,
    [username, passwordHash, rol_id]
  );
  return result.rows[0];
};

const obtenerUsuarios = async () => {
  const result = await db.query(`
    SELECT u.id, u.username, r.nombre AS rol
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    ORDER BY u.id
  `);
  return result.rows;
};

const obtenerUsuarioPorId = async (id) => {
  const result = await db.query(`
    SELECT u.id, u.username, r.nombre AS rol
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    WHERE u.id = $1
  `, [id]);
  return result.rows[0];
};

const actualizarUsuario = async (id, { username, password, rol_id }) => {
  let query, params;
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    query = `UPDATE usuarios SET username = $1, password = $2, rol_id = $3 WHERE id = $4 RETURNING *`;
    params = [username, passwordHash, rol_id, id];
  } else {
    query = `UPDATE usuarios SET username = $1, rol_id = $2 WHERE id = $3 RETURNING *`;
    params = [username, rol_id, id];
  }
  const result = await db.query(query, params);
  return result.rows[0];
};

const eliminarUsuario = async (id) => {
  await db.query(`DELETE FROM usuarios WHERE id = $1`, [id]);
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
};