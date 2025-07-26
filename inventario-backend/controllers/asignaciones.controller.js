const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const AsignacionModel = require("../models/asignaciones.model");
const { generarActaPDF } = require('../services/pdf.service');
const { generarActaPDFConFirmas } = require('../services/pdf.service');
const { enviarActaPorCorreo } = require('../services/email.service');

const listarAsignaciones = async (req, res) => {
  try {
    const asignaciones = await AsignacionModel.obtenerAsignaciones();
    res.status(200).json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener asignaciones" });
  }
};

const obtenerHistorialPorEquipo = async (req, res) => {
  try {
    const { equipo_id } = req.params;
    const historial = await AsignacionModel.obtenerHistorialPorEquipo(equipo_id);
    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial", detalle: error.message });
  }
};

const asignarEquipoPorDNI = async (req, res) => {
  try {
    const nuevaAsignacionCompleta = await AsignacionModel.crearAsignacionPorDNI(req.body);

    const datosParaPDF = {
      numeroActa: nuevaAsignacionCompleta.asignacion.id,
      empleado: nuevaAsignacionCompleta.empleado,
      equipo: nuevaAsignacionCompleta.equipo,
      observaciones: nuevaAsignacionCompleta.asignacion.observaciones,
      fecha_entrega: nuevaAsignacionCompleta.asignacion.fecha_entrega,
    };

    const nombreArchivo = `Acta-Entrega-${datosParaPDF.numeroActa}.pdf`;
    const pdfBuffer = await generarActaPDF(datosParaPDF, 'entrega');

    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'entrega').catch(err => {
        console.error("Fallo al enviar el correo de entrega por DNI:", err);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
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
    const { fecha_devolucion, observacion_devolucion } = req.body;

    const resultado = await AsignacionModel.devolverEquipo(id, fecha_devolucion, observacion_devolucion);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error al devolver equipo", detalle: error.message });
  }
};

const crearAsignacionYGenerarActa = async (req, res) => {
  try {
    const nuevaAsignacion = await AsignacionModel.crearAsignacion(req.body);

    const datosParaPDF = {
      numeroActa: nuevaAsignacion.asignacion.id,
      empleado: nuevaAsignacion.empleado,
      equipo: nuevaAsignacion.equipo,
      observaciones: nuevaAsignacion.asignacion.observaciones,
      fecha_entrega: nuevaAsignacion.asignacion.fecha_entrega,
    };

    const nombreArchivo = `Acta-Entrega-${datosParaPDF.numeroActa}.pdf`;
    const pdfBuffer = await generarActaPDF(datosParaPDF, 'entrega');

    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'entrega').catch(err => {
        console.error("Fallo al enviar el correo de entrega:", err);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error en el proceso de asignación:", error);
    res.status(500).json({ error: "Error en el proceso de asignación", detalle: error.message });
  }
};

const crearAsignacionConFirmas = async (req, res) => {
  try {
    const { dni, equipo_id, observaciones, firmaEntrega, firmaRecibe } = req.body;

    const nuevaAsignacionCompleta = await AsignacionModel.crearAsignacionPorDNI({ dni, equipo_id, observaciones });

    const datosParaPDF = {
      ...nuevaAsignacionCompleta,
      observaciones: nuevaAsignacionCompleta.asignacion.observaciones,
      fecha_entrega: nuevaAsignacionCompleta.asignacion.fecha_entrega,
      firmaEntrega,
      firmaRecibe,
    };

    const nombreArchivo = `Acta-Entrega-Firmada-${datosParaPDF.asignacion.id}.pdf`;
    
    const pdfBuffer = await generarActaPDFConFirmas(datosParaPDF, 'entrega');

    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'entrega').catch(err => {
        console.error("Fallo al enviar el correo de entrega:", err);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error en el proceso de asignación con firmas:", error);
    res.status(500).json({ error: "Error en el proceso de asignación con firmas", detalle: error.message });
  }
};

module.exports = {
  listarAsignaciones,
  registrarAsignacion,
  devolverEquipo,
  asignarEquipoPorDNI,
  obtenerHistorialPorEquipo,
  crearAsignacionYGenerarActa,
  crearAsignacionConFirmas,
};
