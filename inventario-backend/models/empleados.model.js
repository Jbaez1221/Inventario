const db = require("../database");

const obtenerEmpleados = async () => {
  const result = await db.query("SELECT * FROM empleados ORDER BY id ASC");
  return result.rows;
};

const crearEmpleado = async (empleado) => {
  const { nombre_completo, dni, correo, area, cargo, estado, celular } = empleado;

  const result = await db.query(
    `INSERT INTO empleados 
     (nombre_completo, dni, correo, area, cargo, estado, celular) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [nombre_completo, dni, correo, area, cargo, estado || 'Activo', celular]
  );

  return result.rows[0];
};

const actualizarEmpleado = async (id, empleado) => {
  const { nombre_completo, dni, correo, area, cargo, estado, celular } = empleado;

  const result = await db.query(
    `UPDATE empleados 
     SET nombre_completo = $1, dni = $2, correo = $3, area = $4, cargo = $5, estado = $6, celular = $7 
     WHERE id = $8 RETURNING *`,
    [nombre_completo, dni, correo, area, cargo, estado, celular, id]
  );

  return result.rows[0];
};

const eliminarEmpleado = async (id) => {
  await db.query("DELETE FROM empleados WHERE id = $1", [id]);
};

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
