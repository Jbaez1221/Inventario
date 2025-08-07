const db = require('../database');

const obtenerRoles = async () => {
  const result = await db.query(`SELECT * FROM roles ORDER BY id`);
  return result.rows;
};

const crearRol = async (nombre) => {
  const nombreLower = nombre.toLowerCase();
  const existe = await db.query('SELECT id FROM roles WHERE LOWER(nombre) = $1', [nombreLower]);
  if (existe.rows.length > 0) {
    throw new Error('El rol ya existe.');
  }
  const result = await db.query(
    'INSERT INTO roles (nombre) VALUES ($1) RETURNING *',
    [nombreLower]
  );
  return result.rows[0];
};

const actualizarRol = async (id, nombre) => {
  const nombreLower = nombre.toLowerCase();
  const existe = await db.query('SELECT id FROM roles WHERE LOWER(nombre) = $1 AND id <> $2', [nombreLower, id]);
  if (existe.rows.length > 0) {
    throw new Error('El rol ya existe.');
  }
  const result = await db.query(
    'UPDATE roles SET nombre = $1 WHERE id = $2 RETURNING *',
    [nombreLower, id]
  );
  return result.rows[0];
};

const eliminarRol = async (id) => {
  await db.query('DELETE FROM roles WHERE id = $1', [id]);
};

module.exports = {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
};