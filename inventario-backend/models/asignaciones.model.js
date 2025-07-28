const path = require('path');
const db = require(path.join(__dirname, '..', 'database'));

const obtenerAsignaciones = async () => {
  const result = await db.query(`
    SELECT 
      a.id, 
      a.fecha_entrega, 
      a.fecha_devolucion, 
      a.observaciones, 
      a.acta_pdf,
      a.imagen_entrada_url,
      a.imagen_salida_url,
      a.equipo_id,
      a.observacion_devolucion,
      e.nombres || ' ' || e.apellidos AS empleado,
      e.dni AS empleado_dni,
      e.area AS empleado_area,
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

const crearAsignacion = async (asignacion) => {
  const {
    empleado_id,
    equipo_id,
    fecha_entrega,
    observaciones,
    acta_pdf = null,
    imagen_entrada_url = null,
    imagen_salida_url = null
  } = asignacion;

  const fechaEntregaValida = fecha_entrega || new Date();

  const result = await db.query(
    `INSERT INTO asignaciones (
      empleado_id, equipo_id, fecha_entrega, observaciones, acta_pdf, imagen_entrada_url, imagen_salida_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [empleado_id, equipo_id, fechaEntregaValida, observaciones, acta_pdf, imagen_entrada_url, imagen_salida_url]
  );
  const nuevaAsignacion = result.rows[0];

  await db.query(
    `UPDATE equipos SET estado = 'Asignado' WHERE id = $1`,
    [equipo_id]
  );

  const empleadoRes = await db.query("SELECT * FROM empleados WHERE id = $1", [empleado_id]);
  const equipoRes = await db.query("SELECT * FROM equipos WHERE id = $1", [equipo_id]);

  return {
    mensaje: "Asignación creada correctamente",
    asignacion: nuevaAsignacion,
    empleado: empleadoRes.rows[0],
    equipo: equipoRes.rows[0]
  };
};

const devolverEquipo = async (asignacion_id, fecha_devolucion, observacion_devolucion, imagen_salida_url = null) => {
  const asignacionRes = await db.query("SELECT equipo_id FROM asignaciones WHERE id = $1", [asignacion_id]);
  if (asignacionRes.rows.length === 0) {
    throw new Error("Asignación no encontrada");
  }
  const equipo_id = asignacionRes.rows[0].equipo_id;

  const result = await db.query(
    `UPDATE asignaciones SET fecha_devolucion = $1, observacion_devolucion = $2, imagen_salida_url = $3 WHERE id = $4 RETURNING *`,
    [fecha_devolucion, observacion_devolucion, imagen_salida_url, asignacion_id]
  );
  const asignacionActualizada = result.rows[0];

  await db.query(
    `UPDATE equipos SET estado = 'Disponible' WHERE id = $1`,
    [equipo_id]
  );

  const empleadoRes = await db.query("SELECT * FROM empleados WHERE id = $1", [asignacionActualizada.empleado_id]);
  const equipoRes = await db.query("SELECT * FROM equipos WHERE id = $1", [asignacionActualizada.equipo_id]);

  return {
    mensaje: "Equipo devuelto correctamente",
    asignacion: asignacionActualizada,
    empleado: empleadoRes.rows[0],
    equipo: equipoRes.rows[0]
  };
};

const obtenerHistorialPorEquipo = async (equipo_id) => {
  const result = await db.query(`
    SELECT a.id, a.fecha_entrega, a.fecha_devolucion, a.observaciones, a.observacion_devolucion,
           a.imagen_entrada_url, a.imagen_salida_url, a.acta_pdf,
           e.nombres || ' ' || e.apellidos AS empleado,
           e.puesto,
           e.area
    FROM asignaciones a
    JOIN empleados e ON a.empleado_id = e.id
    WHERE a.equipo_id = $1
    ORDER BY a.fecha_entrega DESC
  `, [equipo_id]);

  return result.rows;
};

const crearAsignacionPorDNI = async (datos) => {
  const { dni, equipo_id, fecha_entrega, observaciones, acta_pdf, imagen_entrada_url, imagen_salida_url } = datos;

  const empleadoRes = await db.query("SELECT * FROM empleados WHERE dni = $1", [dni]);
  if (empleadoRes.rows.length === 0) {
    throw new Error(`No se encontró un empleado con el DNI ${dni}`);
  }
  const empleado = empleadoRes.rows[0];

  return crearAsignacion({
    empleado_id: empleado.id,
    equipo_id,
    fecha_entrega,
    observaciones,
    acta_pdf,
    imagen_entrada_url,
    imagen_salida_url
  });
};

module.exports = {
  obtenerAsignaciones,
  crearAsignacion,
  devolverEquipo,
  obtenerHistorialPorEquipo,
  crearAsignacionPorDNI,
};
