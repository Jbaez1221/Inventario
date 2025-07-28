const SolicitudModel = require('../models/solicitudes.model');
const db = require('../database');
const { enviarNotificacionSolicitud } = require('../services/email.service');

const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await SolicitudModel.getSolicitudes();
    res.status(200).json(solicitudes);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ error: 'Error al obtener solicitudes', detalle: error.message });
  }
};

const crearSolicitud = async (req, res) => {
  const { dni, tipo_equipo, motivo, marca, modelo, tipo } = req.body;

  if (!dni || !tipo_equipo || !motivo || !tipo) {
    return res.status(400).json({ error: "Los campos DNI, tipo de equipo, motivo y tipo de solicitud son obligatorios" });
  }

  try {
    const empleadoRes = await db.query('SELECT id FROM empleados WHERE dni = $1', [dni]);
    if (empleadoRes.rows.length === 0) {
      return res.status(404).json({ error: "Su DNI no está registrado en CORASUR" });
    }
    const empleado_id = empleadoRes.rows[0].id;

    const nuevaSolicitud = await SolicitudModel.crearSolicitud({
      empleado_id,
      tipo_equipo,
      motivo,
      marca,
      modelo,
      tipo
    });

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ error: 'Error al crear la solicitud', detalle: error.message });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo_rechazo } = req.body;

    if (!["aprobada", "rechazada", "atendida"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    // Cambia el estado en la BD (sin guardar motivo de rechazo)
    const solicitudActualizada = await SolicitudModel.cambiarEstado(id, estado);

    // Obtener el empleado para notificación
    const empleadoRes = await db.query(
      `SELECT * FROM empleados WHERE id = $1`,
      [solicitudActualizada.empleado_id]
    );
    const empleado = empleadoRes.rows[0];

    // Enviar notificación por correo
    await enviarNotificacionSolicitud({
      empleado,
      estado,
      motivoRechazo: estado === "rechazada" ? motivo_rechazo : ""
    });

    res.status(200).json(solicitudActualizada);
  } catch (error) {
    console.error("Error al cambiar el estado:", error);
    res.status(500).json({ error: 'Error al cambiar el estado', detalle: error.message });
  }
};

module.exports = {
  getSolicitudes,
  crearSolicitud,
  cambiarEstado,
};
