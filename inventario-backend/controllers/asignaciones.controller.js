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

    // Crear acta PDF con PDFKit
    const actaFileName = `acta_equipo_${equipo_id}_${Date.now()}.pdf`;
    const actaPath = path.join(__dirname, "..", "public", "actas", actaFileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(actaPath));

    doc.fontSize(14).text("CORASUR S.A - ÁREA DE SISTEMAS", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("ACTA DE ENTREGA DE EQUIPO INFORMÁTICO", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Por medio de la presente, Yo ${empleado.nombre_completo} identificado con documento ${empleado.dni}, trabajador de la empresa CORASUR S.A, Local AV. GARCILASO, hago constar que para el desempeño de actividades asignadas por la empresa, poseo un celular con las siguientes características:`);
    doc.moveDown();
    doc.text(`ID: ${equipo.id}`);
    doc.text(`Tipo: ${equipo.tipo}`);
    doc.text(`Marca: ${equipo.marca}`);
    doc.text(`Modelo: ${equipo.modelo}`);
    doc.text(`Serie: ${equipo.serie}`);
    doc.text(`Observaciones: ${observaciones || "—"}`);
    doc.moveDown();
    doc.text(`Fecha de Entrega: ${fecha_entrega}`);
    doc.moveDown();
    doc.text("Firma Entrega: ___________________________");
    doc.text("Firma Recepción: _________________________");

    doc.end();

    // Registrar asignación con ruta al PDF
    const nueva = await AsignacionModel.crearAsignacion({
      empleado_id: empleado.id,
      equipo_id,
      fecha_entrega,
      observaciones,
      acta_pdf: actaFileName, // nuevo campo
    });

    // Opcional: enviar el PDF por correo
    if (empleado.correo) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
      });

      

      await transporter.sendMail({
        from: '"CORASUR S.A" <hunt3r1221@gmail.com>',
        to: empleado.correo,
        subject: "Acta de Entrega de Equipo",
        text: "Adjunto encontrarás el acta de entrega del equipo asignado.",
        attachments: [{ filename: actaFileName, path: actaPath }],
      });
    }

    res.status(201).json({ mensaje: "Equipo asignado y acta generada", asignacion: nueva });
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
