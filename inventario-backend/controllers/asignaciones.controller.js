const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const AsignacionModel = require("../models/asignaciones.model");
const { generarActaPDF } = require('../services/pdf.service');
const { enviarActaPorCorreo } = require('../services/email.service');
// La base de datos está en la raíz, no en /config. Subimos un nivel desde /controllers.
const db = require('../database');

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
  try {
    // Esta función ahora existe en el modelo y devuelve la estructura correcta
    const nuevaAsignacionCompleta = await AsignacionModel.crearAsignacionPorDNI(req.body);

    // Preparar los datos para el PDF
    const datosParaPDF = {
      numeroActa: nuevaAsignacionCompleta.asignacion.id,
      empleado: nuevaAsignacionCompleta.empleado,
      equipo: nuevaAsignacionCompleta.equipo,
      observaciones: nuevaAsignacionCompleta.asignacion.observaciones,
      fecha_entrega: nuevaAsignacionCompleta.asignacion.fecha_entrega,
    };

    // Generar el PDF
    const nombreArchivo = `Acta-Entrega-${datosParaPDF.numeroActa}.pdf`;
    const pdfBuffer = await generarActaPDF(datosParaPDF, 'entrega');

    // Enviar correo (opcional)
    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'entrega').catch(err => {
        console.error("Fallo al enviar el correo de entrega por DNI:", err);
    });

    // Enviar el PDF al frontend
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
    // Este bloque ahora capturará el error si el DNI no se encuentra
    console.error("Error en el proceso de asignación por DNI:", error);
    res.status(500).json({ error: "Error en el proceso de asignación por DNI", detalle: error.message });
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

const crearAsignacionYGenerarActa = async (req, res) => {
  try {
    // 1. Crear la asignación en la base de datos
    const nuevaAsignacion = await AsignacionModel.crearAsignacion(req.body);

    // 2. Obtener los datos completos para el PDF
    const datosParaPDF = {
      numeroActa: nuevaAsignacion.asignacion.id,
      empleado: nuevaAsignacion.empleado,
      equipo: nuevaAsignacion.equipo,
      observaciones: nuevaAsignacion.asignacion.observaciones,
      fecha_entrega: nuevaAsignacion.asignacion.fecha_entrega,
    };

    // 3. Generar el PDF
    const nombreArchivo = `Acta-Entrega-${datosParaPDF.numeroActa}.pdf`;
    const pdfBuffer = await generarActaPDF(datosParaPDF, 'entrega');

    // 4. Enviar correo en segundo plano (opcional, pero consistente)
    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'entrega').catch(err => {
        console.error("Fallo al enviar el correo de entrega:", err);
    });

    // 5. Enviar el PDF al frontend para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error en el proceso de asignación:", error);
    res.status(500).json({ error: "Error en el proceso de asignación", detalle: error.message });
  }
};

module.exports = {
  listarAsignaciones,
  registrarAsignacion,
  devolverEquipo,
  asignarEquipoPorDNI,
  obtenerHistorialPorEquipo,
  crearAsignacionYGenerarActa,
};
