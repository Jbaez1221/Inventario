const db = require("../database");

// Obtener todas las asignaciones
const obtenerAsignaciones = async () => {
  const result = await db.query(`
    SELECT 
      a.id, 
      a.fecha_entrega, 
      a.fecha_devolucion, 
      a.observaciones, 
      a.acta_pdf,
      a.equipo_id,                    
      e.nombre_completo AS empleado,
      e.dni AS empleado_dni,          
      eq.id AS equipo_id,             
      eq.serie AS equipo_serie, 
      eq.tipo AS equipo_tipo,
      eq.marca AS equipo_marca,       
      eq.modelo AS equipo_modelo
    FROM asignaciones a
    JOIN empleados e ON a.empleado_id = e.id
    JOIN equipos eq ON a.equipo_id = eq.id
    ORDER BY a.id ASC
  `);
  return result.rows;
};

// Registrar una nueva asignación (ahora incluye acta_pdf)
const crearAsignacion = async (asignacion) => {
  const { empleado_id, equipo_id, fecha_entrega, observaciones, acta_pdf } = asignacion;

  // Verificar si el equipo ya está asignado
  const check = await db.query(
    `SELECT estado FROM equipos WHERE id = $1`,
    [equipo_id]
  );

  if (check.rows.length === 0) {
    throw new Error("Equipo no encontrado");
  }

  if (check.rows[0].estado === 'Asignado') {
    throw new Error("Este equipo ya está asignado");
  }

  // Insertar asignación incluyendo el nombre del PDF
  const result = await db.query(
    `INSERT INTO asignaciones 
     (empleado_id, equipo_id, fecha_entrega, observaciones, acta_pdf)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [empleado_id, equipo_id, fecha_entrega, observaciones, acta_pdf]
  );

  // Cambiar estado del equipo a 'Asignado'
  await db.query(`UPDATE equipos SET estado = 'Asignado' WHERE id = $1`, [equipo_id]);

  return result.rows[0];
};

// Devolver equipo y actualizar estado
const devolverEquipo = async (asignacion_id, fecha_devolucion) => {
  await db.query(
    `UPDATE asignaciones SET fecha_devolucion = $1 WHERE id = $2`,
    [fecha_devolucion, asignacion_id]
  );

  const result = await db.query(
    `SELECT equipo_id FROM asignaciones WHERE id = $1`,
    [asignacion_id]
  );

  if (result.rows.length === 0) {
    throw new Error("Asignación no encontrada");
  }

  const equipo_id = result.rows[0].equipo_id;

  await db.query(
    `UPDATE equipos SET estado = 'Disponible' WHERE id = $1`,
    [equipo_id]
  );

  return { mensaje: "Equipo devuelto correctamente" };
};

// Historial por equipo
const obtenerHistorialPorEquipo = async (equipo_id) => {
  const result = await db.query(`
    SELECT a.id, a.fecha_entrega, a.fecha_devolucion, a.observaciones,
           e.nombre_completo AS empleado
    FROM asignaciones a
    JOIN empleados e ON a.empleado_id = e.id
    WHERE a.equipo_id = $1
    ORDER BY a.fecha_entrega DESC
  `, [equipo_id]);

  return result.rows;
};

module.exports = {
  obtenerAsignaciones,
  crearAsignacion,
  devolverEquipo,
  obtenerHistorialPorEquipo,
};
