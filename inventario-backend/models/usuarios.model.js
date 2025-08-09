const db = require('../database');
const bcrypt = require('bcryptjs');

const crearUsuario = async ({ dni, rol_id }) => {
  if (!dni) throw new Error("DNI es requerido para crear usuario enlazado a empleado");

  const empleadoResult = await db.query(
    "SELECT id, nombres, apellidos, correo_institucional, correo_personal FROM empleados WHERE dni = $1",
    [dni]
  );
  if (empleadoResult.rows.length === 0) {
    throw new Error("No existe un empleado con ese DNI");
  }
  const empleado = empleadoResult.rows[0];

  const username = empleado.correo_institucional || empleado.correo_personal;
  if (!username) throw new Error("El empleado no tiene correo registrado");

  const nombreLetra = empleado.nombres ? empleado.nombres[0].toUpperCase() : '';
  const apellidoLetra = empleado.apellidos ? empleado.apellidos[0].toUpperCase() : '';
  const passwordPlano = `${dni}${nombreLetra}${apellidoLetra}`;
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  const result = await db.query(
    `INSERT INTO usuarios (username, password, rol_id, empleado_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [username, passwordHash, rol_id, empleado.id]
  );
  return { ...result.rows[0], password_generada: passwordPlano };
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