const db = require("../database");

const obtenerEmpleados = async () => {
  const result = await db.query(`
    SELECT e.*, 
      EXISTS (
        SELECT 1 FROM asignaciones a WHERE a.empleado_id = e.id
      ) AS tiene_asignaciones
    FROM empleados e
    ORDER BY e.id ASC
  `);
  return result.rows;
};

const crearEmpleado = async (empleado) => {
  const { 
    nombres, apellidos, dni, correo_institucional, correo_personal, 
    area, puesto, estado, telefono_coorporativo, telefono_personal, sede 
  } = empleado;

  const result = await db.query(
    `INSERT INTO empleados 
     (nombres, apellidos, dni, correo_institucional, correo_personal, area, puesto, estado, telefono_coorporativo, telefono_personal, sede) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      nombres, apellidos, dni, correo_institucional, correo_personal, 
      area, puesto, estado || 'Activo', telefono_coorporativo, telefono_personal, sede
    ]
  );

  return result.rows[0];
};

const actualizarEmpleado = async (id, empleado) => {
  const { 
    nombres, apellidos, dni, correo_institucional, correo_personal, 
    area, puesto, estado, telefono_coorporativo, telefono_personal, sede 
  } = empleado;

  const result = await db.query(
    `UPDATE empleados 
     SET nombres = $1, apellidos = $2, dni = $3, correo_institucional = $4, correo_personal = $5, 
         area = $6, puesto = $7, estado = $8, telefono_coorporativo = $9, telefono_personal = $10, sede = $11 
     WHERE id = $12 RETURNING *`,
    [
      nombres, apellidos, dni, correo_institucional, correo_personal, 
      area, puesto, estado, telefono_coorporativo, telefono_personal, sede, id
    ]
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

const tieneAsignaciones = async (empleadoId) => {
  const result = await db.query(
    "SELECT COUNT(*) FROM asignaciones WHERE empleado_id = $1",
    [empleadoId]
  );
  return parseInt(result.rows[0].count, 10) > 0;
};

module.exports = {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  buscarPorDni,
  tieneAsignaciones,
};
