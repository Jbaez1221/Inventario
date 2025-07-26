const db = require('../database');

const SolicitudModel = {
  async getSolicitudes() {
    const result = await db.query(`
      SELECT 
        s.id, s.empleado_id, s.tipo_equipo, s.motivo, s.estado, 
        s.fecha_solicitud, s.marca, s.modelo, s.tipo,
        e.nombres || ' ' || e.apellidos AS empleado_nombre,
        e.area AS empleado_area,
        e.puesto AS empleado_puesto,
        e.sede AS empleado_sede
      FROM solicitudes s
      LEFT JOIN empleados e ON s.empleado_id = e.id
      ORDER BY s.fecha_solicitud DESC
    `);
    return result.rows;
  },

  async crearSolicitud(solicitud) {
    const { empleado_id, tipo_equipo, motivo, marca, modelo, tipo } = solicitud;

    const result = await db.query(
      `INSERT INTO solicitudes (empleado_id, tipo_equipo, motivo, marca, modelo, tipo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [empleado_id, tipo_equipo, motivo, marca, modelo, tipo]
    );
    return result.rows[0];
  },

  async cambiarEstado(id, estado) {
    const result = await db.query(
      'UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    if (result.rows.length === 0) {
      throw new Error('Solicitud no encontrada');
    }
    return result.rows[0];
  },
};

module.exports = SolicitudModel;
