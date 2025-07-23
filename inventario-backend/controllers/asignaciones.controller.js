const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const AsignacionModel = require("../models/asignaciones.model");
const db = require("../database");

// Listar asignaciones
const listarAsignaciones = async (req, res) => {
  try {
    const asignaciones = await AsignacionModel.obtenerAsignaciones();
    res.status(200).json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener asignaciones" });
  }
};

// Obtener historial por equipo
const obtenerHistorialPorEquipo = async (req, res) => {
  const { equipo_id } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        a.fecha_entrega, 
        a.fecha_devolucion, 
        a.observaciones,
        e.nombre_completo AS nombre_empleado
      FROM asignaciones a
      JOIN empleados e ON a.empleado_id = e.id
      WHERE a.equipo_id = $1
      ORDER BY a.fecha_entrega DESC
    `, [equipo_id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener historial" });
  }
};

// Asignar equipo por DNI y generar acta
const asignarEquipoPorDNI = async (req, res) => {
  const { equipo_id, dni, observaciones = "" } = req.body;

  try {
    const result = await db.query("SELECT * FROM empleados WHERE dni = $1", [dni]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    const empleado = result.rows[0];

    // Validar que el equipo no esté asignado actualmente
    const validacion = await db.query(
      `SELECT * FROM asignaciones WHERE equipo_id = $1 AND fecha_devolucion IS NULL`,
      [equipo_id]
    );
    if (validacion.rows.length > 0) {
      return res.status(400).json({ error: "El equipo ya está asignado" });
    }

    const fecha_entrega = new Date().toISOString().split("T")[0];

    // Obtener datos del equipo
    const equipoRes = await db.query("SELECT * FROM equipos WHERE id = $1", [equipo_id]);
    const equipo = equipoRes.rows[0];

    // Registrar asignación (sin PDF)
    const nueva = await AsignacionModel.crearAsignacion({
      empleado_id: empleado.id,
      equipo_id,
      fecha_entrega,
      observaciones,
      // acta_pdf eliminado
    });

    // Devuelve todos los datos necesarios para que el frontend genere el PDF
    res.status(201).json({ 
      mensaje: "Equipo asignado",
      asignacion: nueva,
      empleado,
      equipo,
      fecha_entrega,
      observaciones
    });
  } catch (error) {
    console.error("Error al asignar equipo:", error);
    res.status(500).json({ error: "Error al asignar equipo", detalle: error.message });
  }
};

const registrarAsignacion = async (req, res) => {
  try {
    const asignacion = req.body;
    const nueva = await AsignacionModel.crearAsignacion(asignacion);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar asignación", detalle: error.message });
  }
};

const devolverEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_devolucion } = req.body;

    const resultado = await AsignacionModel.devolverEquipo(id, fecha_devolucion);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error al devolver equipo", detalle: error.message });
  }
};

module.exports = {
  listarAsignaciones,
  registrarAsignacion,
  devolverEquipo,
  asignarEquipoPorDNI,
  obtenerHistorialPorEquipo,
};
