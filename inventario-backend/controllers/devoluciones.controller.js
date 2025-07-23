const AsignacionModel = require("../models/asignaciones.model");
const { generarActaPDF } = require('../services/pdf.service');
const { enviarActaPorCorreo } = require('../services/email.service');

const devolverEquipoYGenerarActa = async (req, res) => {
  const { asignacion_id } = req.params;
  const { fecha_devolucion, observaciones } = req.body;

  try {
    const resultadoDevolucion = await AsignacionModel.devolverEquipo(
      asignacion_id,
      fecha_devolucion,
      observaciones
    );

    const datosParaPDF = {
      numeroActa: resultadoDevolucion.asignacion.id,
      empleado: resultadoDevolucion.empleado,
      equipo: resultadoDevolucion.equipo,
      observaciones: resultadoDevolucion.asignacion.observaciones,
      fecha_devolucion: resultadoDevolucion.asignacion.fecha_devolucion,
    };

    const nombreArchivo = `Acta-Devolucion-${datosParaPDF.numeroActa}.pdf`;
    const pdfBuffer = await generarActaPDF(datosParaPDF, 'devolución');

    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'devolucion').catch(err => {
        console.error("Fallo al enviar el correo de devolución:", err);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error en el proceso de devolución:", error);
    res.status(500).json({ error: "Error en el proceso de devolución", detalle: error.message });
  }
};

module.exports = { devolverEquipoYGenerarActa };