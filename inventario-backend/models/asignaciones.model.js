const path = require('path');
// La base de datos está en la raíz, no en /config. Subimos un nivel desde /models.
const db = require(path.join(__dirname, '..', 'database'));

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
  // 1. Extraer los datos del objeto de asignación
  const { empleado_id, equipo_id, observaciones } = asignacion;
  
  // 2. Asegurar que la fecha de entrega siempre tenga un valor.
  // Si no viene del frontend, se usa la fecha y hora actual.
  const fechaEntregaValida = asignacion.fecha_entrega || new Date();

  // 3. Insertar la nueva asignación usando la fecha validada
  const result = await db.query(
    `INSERT INTO asignaciones (empleado_id, equipo_id, fecha_entrega, observaciones)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [empleado_id, equipo_id, fechaEntregaValida, observaciones]
  );
  const nuevaAsignacion = result.rows[0];

  // 4. Actualizar el estado del equipo a 'Asignado'
  await db.query(
    `UPDATE equipos SET estado = 'Asignado' WHERE id = $1`,
    [equipo_id]
  );

  // 3. Obtener datos completos para el acta
  const empleadoRes = await db.query("SELECT * FROM empleados WHERE id = $1", [empleado_id]);
  const equipoRes = await db.query("SELECT * FROM equipos WHERE id = $1", [equipo_id]);

  // 4. Devolver toda la información necesaria
  return {
    mensaje: "Asignación creada correctamente",
    asignacion: nuevaAsignacion,
    empleado: empleadoRes.rows[0],
    equipo: equipoRes.rows[0]
  };
};

// Devolver equipo y actualizar estado
const devolverEquipo = async (asignacion_id, fecha_devolucion, observaciones) => {
  // Obtener el equipo_id antes de actualizar
  const asignacionRes = await db.query("SELECT equipo_id FROM asignaciones WHERE id = $1", [asignacion_id]);
  if (asignacionRes.rows.length === 0) {
    throw new Error("Asignación no encontrada");
  }
  const equipo_id = asignacionRes.rows[0].equipo_id;

  // Actualizar la asignación con fecha de devolución y observaciones
  const result = await db.query(
    `UPDATE asignaciones SET fecha_devolucion = $1, observaciones = $2 WHERE id = $3 RETURNING *`,
    [fecha_devolucion, observaciones, asignacion_id]
  );
  const asignacionActualizada = result.rows[0];

  // Actualizar el estado del equipo a 'Disponible'
  await db.query(
    `UPDATE equipos SET estado = 'Disponible' WHERE id = $1`,
    [equipo_id]
  );

  // Obtener datos completos del empleado y del equipo para el acta
  const empleadoRes = await db.query("SELECT * FROM empleados WHERE id = $1", [asignacionActualizada.empleado_id]);
  const equipoRes = await db.query("SELECT * FROM equipos WHERE id = $1", [asignacionActualizada.equipo_id]);

  // Devolver toda la información necesaria
  return {
    mensaje: "Equipo devuelto correctamente",
    asignacion: asignacionActualizada,
    empleado: empleadoRes.rows[0],
    equipo: equipoRes.rows[0]
  };
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

// ✅ AÑADIR ESTA NUEVA FUNCIÓN
const crearAsignacionPorDNI = async (datos) => {
  const { dni, equipo_id, fecha_entrega, observaciones } = datos;

  // 1. Buscar al empleado por DNI
  const empleadoRes = await db.query("SELECT * FROM empleados WHERE dni = $1", [dni]);
  if (empleadoRes.rows.length === 0) {
    // Si no se encuentra, lanzamos un error que será capturado por el controlador
    throw new Error(`No se encontró un empleado con el DNI ${dni}`);
  }
  const empleado = empleadoRes.rows[0];

  // 2. Reutilizar la lógica de creación existente para mantener la consistencia.
  // Pasamos el ID del empleado encontrado a la función que ya funciona.
  return crearAsignacion({
    empleado_id: empleado.id,
    equipo_id,
    fecha_entrega,
    observaciones
  });
};

module.exports = {
  obtenerAsignaciones,
  crearAsignacion,
  devolverEquipo,
  obtenerHistorialPorEquipo,
  crearAsignacionPorDNI, // Asegúrate de exportar la nueva función
};
