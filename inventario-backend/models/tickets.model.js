const db = require("../database");

async function generarCodigoTicket() {
  const year = new Date().getFullYear();
  const result = await db.query(
    "SELECT COUNT(*) FROM tickets WHERE EXTRACT(YEAR FROM fecha_creacion) = $1",
    [year]
  );
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `TCK-CORASUR-${year}-${String(count).padStart(5, "0")}`;
}

const crearTicket = async (ticket) => {
  const codigo = await generarCodigoTicket();
  const campos = [
    "codigo", "solicitante_id", "correo_solicitante", "area_solicitante", "celular_solicitante",
    "tipo", "categoria", "prioridad", "estado", "observacion_inicial", "anydesk_info"
  ];
  const valores = [
    codigo,
    ticket.solicitante_id,
    ticket.correo_solicitante,
    ticket.area_solicitante,
    ticket.celular_solicitante,
    ticket.tipo,
    ticket.categoria,
    ticket.prioridad,
    "Abierto",
    ticket.observacion_inicial,
    ticket.anydesk_info || null
  ];
  const placeholders = campos.map((_, i) => `$${i + 1}`).join(", ");
  const result = await db.query(
    `INSERT INTO tickets (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`,
    valores
  );
  return result.rows[0];
};

const listarTickets = async () => {
  const result = await db.query(`
    SELECT 
      t.*,
      es.nombres AS solicitante_nombres,
      es.apellidos AS solicitante_apellidos,
      ea.nombres AS asignado_nombres,
      ea.apellidos AS asignado_apellidos
    FROM tickets t
    JOIN empleados es ON t.solicitante_id = es.id
    LEFT JOIN empleados ea ON t.personal_asignado_id = ea.id
    ORDER BY t.fecha_creacion DESC
  `);
  return result.rows;
};

const obtenerTicketPorId = async (id) => {
  const result = await db.query(`
    SELECT 
      t.*,
      es.nombres AS solicitante_nombres,
      es.apellidos AS solicitante_apellidos,
      ea.nombres AS asignado_nombres,
      ea.apellidos AS asignado_apellidos
    FROM tickets t
    JOIN empleados es ON t.solicitante_id = es.id
    LEFT JOIN empleados ea ON t.personal_asignado_id = ea.id
    WHERE t.id = $1
  `, [id]);
  return result.rows[0];
};

const asignarPersonal = async (ticketId, personalId, comentarios) => {
  const result = await db.query(
    `UPDATE tickets SET personal_asignado_id = $1, fecha_asignacion = NOW(), comentarios_asignacion = $2, estado = 'En proceso' WHERE id = $3 RETURNING *`,
    [personalId, comentarios, ticketId]
  );
  return result.rows[0];
};

const cambiarEstadoTicket = async (ticketId, estado, solucion_aplicada, satisfaccion) => {
  const campos = [];
  const valores = [];
  let i = 1;
  if (estado) {
    campos.push(`estado = $${i++}`);
    valores.push(estado);
  }
  if (solucion_aplicada !== undefined) {
    campos.push(`solucion_aplicada = $${i++}`);
    valores.push(solucion_aplicada);
  }
  if (satisfaccion !== undefined) {
    campos.push(`satisfaccion = $${i++}`);
    valores.push(satisfaccion);
  }
  if (estado === "Cerrado") {
    campos.push(`fecha_cierre = NOW()`);
  }
  valores.push(ticketId);
  const set = campos.join(", ");
  const result = await db.query(
    `UPDATE tickets SET ${set} WHERE id = $${valores.length} RETURNING *`,
    valores
  );
  return result.rows[0];
};

const actualizarAnydeskInfo = async (ticketId, anydeskInfo) => {
  const result = await db.query(
    `UPDATE tickets SET anydesk_info = $1 WHERE id = $2 RETURNING *`,
    [anydeskInfo, ticketId]
  );
  return result.rows[0];
};

const agregarHistorial = async (ticketId, usuarioId, accion, detalle) => {
  await db.query(
    `INSERT INTO tickets_historial (ticket_id, usuario_id, accion, detalle) VALUES ($1, $2, $3, $4)`,
    [ticketId, usuarioId, accion, detalle]
  );
};

const listarHistorial = async (ticketId) => {
  const result = await db.query(
    `SELECT h.*, e.nombres, e.apellidos FROM tickets_historial h LEFT JOIN empleados e ON h.usuario_id = e.id WHERE h.ticket_id = $1 ORDER BY h.fecha ASC`,
    [ticketId]
  );
  return result.rows;
};

const listarEmpleadosSistemas = async () => {
  const result = await db.query(
    `SELECT id, nombres, apellidos, correo_institucional FROM empleados WHERE area ILIKE 'sistemas'`
  );
  return result.rows;
};


const buscarPorCodigoYCorreo = async (codigo, correo) => {
  const result = await db.query(
    "SELECT * FROM tickets WHERE codigo = $1 AND correo_solicitante = $2",
    [codigo, correo]
  );
  return result.rows[0];
};

const buscarTicketsSimilares = async ({ categoria, tipo, palabra }) => {
  let query = `
    SELECT 
      t.*,
      ea.nombres AS asignado_nombres,
      ea.apellidos AS asignado_apellidos,
      ea.correo_institucional AS asignado_correo
    FROM tickets t
    LEFT JOIN empleados ea ON t.personal_asignado_id = ea.id
    WHERE t.estado = 'Cerrado'
  `;
  const params = [];
  if (categoria) {
    params.push(categoria);
    query += ` AND t.categoria = $${params.length}`;
  }
  if (tipo) {
    params.push(tipo);
    query += ` AND t.tipo = $${params.length}`;
  }
  if (palabra) {
    params.push(`%${palabra}%`);
    query += ` AND t.solucion_aplicada ILIKE $${params.length}`;
  }
  query += ` ORDER BY t.fecha_creacion DESC`;
  const result = await db.query(query, params);
  return result.rows;
};

const buscarTicketsPorDni = async (dni) => {
  const empleadoResult = await db.query(
    "SELECT id FROM empleados WHERE dni = $1",
    [dni]
  );
  if (empleadoResult.rows.length === 0) return [];
  const empleadoId = empleadoResult.rows[0].id;
  const ticketsResult = await db.query(
    "SELECT * FROM tickets WHERE solicitante_id = $1 ORDER BY fecha_creacion DESC",
    [empleadoId]
  );
  return ticketsResult.rows;
};

const buscarTicketPorCodigo = async (codigo) => {
  const result = await db.query(
    "SELECT * FROM tickets WHERE codigo = $1",
    [codigo]
  );
  return result.rows[0];
};

module.exports = {
  crearTicket,
  listarTickets,
  obtenerTicketPorId,
  asignarPersonal,
  cambiarEstadoTicket,
  actualizarAnydeskInfo,
  agregarHistorial,
  listarHistorial,
  listarEmpleadosSistemas,
  buscarPorCodigoYCorreo,
  buscarTicketsSimilares,
  buscarTicketsPorDni,
  buscarTicketPorCodigo,
};