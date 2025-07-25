const db = require('../database');
const Solicitudes = require("../models/solicitudes.model");

// Obtener todas las solicitudes
const getSolicitudes = (req, res) => {
  Solicitudes.getAll((err, result) => {
    if (err) {
      console.error("Error al obtener solicitudes:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json(result.rows);
  });
};

// Crear una nueva solicitud verificando el DNI del empleado
const crearSolicitud = async (req, res) => {
  const { dni, tipo_equipo, motivo } = req.body;

  if (!dni || !tipo_equipo || !motivo) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el DNI existe en la tabla de empleados
    const queryEmpleado = 'SELECT id FROM empleados WHERE dni = $1';
    const result = await db.query(queryEmpleado, [dni]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Su DNI no está registrado en CORASUR" });
    }

    const empleado_id = result.rows[0].id;

    // Insertar la nueva solicitud
    const insertQuery = `
      INSERT INTO solicitudes (empleado_id, tipo_equipo, motivo, estado, fecha_solicitud)
      VALUES ($1, $2, $3, 'pendiente', NOW())
    `;
    await db.query(insertQuery, [empleado_id, tipo_equipo, motivo]);

    res.status(201).json({ mensaje: "Solicitud registrada correctamente" });

  } catch (err) {
    console.error("Error al crear solicitud:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Cambiar estado de la solicitud (aprobada o rechazada)
const cambiarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["aprobada", "rechazada"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  Solicitudes.updateEstado(id, estado, (err, result) => {
    if (err) {
      console.error("Error al actualizar estado:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    res.json({ mensaje: `Solicitud ${estado} correctamente` });
  });
};

module.exports = {
  getSolicitudes,
  crearSolicitud,
  cambiarEstado,
};
