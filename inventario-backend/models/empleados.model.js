const db = require("../database");

const obtenerEmpleados = async () => {
  const result = await db.query("SELECT * FROM empleados ORDER BY id ASC");
  return result.rows;
};

const crearEmpleado = async (empleado) => {
  const { nombre_completo, dni, correo, area, cargo, estado } = empleado;

  const result = await db.query(
    `INSERT INTO empleados 
     (nombre_completo, dni, correo, area, cargo, estado) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [nombre_completo, dni, correo, area, cargo, estado || 'Activo']
  );

  return result.rows[0];
};

const actualizarEmpleado = async (id, empleado) => {
  const { nombre_completo, dni, correo, area, cargo, estado } = empleado;

  const result = await db.query(
    `UPDATE empleados 
     SET nombre_completo = $1, dni = $2, correo = $3, area = $4, cargo = $5, estado = $6 
     WHERE id = $7 RETURNING *`,
    [nombre_completo, dni, correo, area, cargo, estado, id]
  );

  return result.rows[0]; // undefined si no existe
};

const eliminarEmpleado = async (id) => {
  await db.query("DELETE FROM empleados WHERE id = $1", [id]);
};

// ✅ NUEVO: Buscar empleado por DNI
const buscarPorDni = async (dni) => {
  const result = await db.query("SELECT * FROM empleados WHERE dni = $1", [dni]);
  return result.rows;
};

module.exports = {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  buscarPorDni, 
};
