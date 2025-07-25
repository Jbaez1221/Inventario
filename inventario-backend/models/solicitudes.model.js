const db = require('../database');

const Solicitudes = {
  getAll: (callback) => {
    db.query('SELECT * FROM solicitudes ORDER BY fecha_solicitud DESC', callback);
  },

  create: (data, callback) => {
    const sql = `
      INSERT INTO solicitudes (empleado_id, tipo_equipo, motivo, estado, fecha_solicitud)
      VALUES ($1, $2, $3, 'pendiente', NOW())
    `;
    const values = [data.empleado_id, data.tipo_equipo, data.motivo];
    db.query(sql, values, callback);
  },

  updateEstado: (id, estado, callback) => {
    db.query('UPDATE solicitudes SET estado = $1 WHERE id = $2', [estado, id], callback);
  },
};

module.exports = Solicitudes;
