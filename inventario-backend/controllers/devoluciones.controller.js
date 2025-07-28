const AsignacionModel = require("../models/asignaciones.model");
const { generarActaPDF, generarActaPDFConFirmas } = require('../services/pdf.service');
const { enviarActaPorCorreo } = require('../services/email.service');
const { getRelativeUrl } = require("../middleware/multer.config");

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

    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'devolucion', datosParaPDF.empleado).catch(err => {
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

const devolverEquipoConFirmas = async (req, res) => {
  try {
    const { asignacion_id } = req.params;
    const { observacion_devolucion, firmaRecibe, firmaDevuelve } = req.body;

    let imagen_salida_url = null;
    if (req.file) {
      imagen_salida_url = getRelativeUrl(req.file.path);
    }

    const resultadoDevolucion = await AsignacionModel.devolverEquipo(
      asignacion_id, 
      new Date(),
      observacion_devolucion,
      imagen_salida_url
    );

    const datosParaPDF = {
      numeroActa: resultadoDevolucion.asignacion.id,
      empleado: resultadoDevolucion.empleado,
      equipo: resultadoDevolucion.equipo,
      observaciones: resultadoDevolucion.asignacion.observaciones,
      observacion_devolucion: resultadoDevolucion.asignacion.observacion_devolucion,
      fecha_devolucion: resultadoDevolucion.asignacion.fecha_devolucion,
      firmaRecibe,
      firmaDevuelve,
    };

    const nombreArchivo = `Acta-Devolucion-Firmada-${datosParaPDF.numeroActa}.pdf`;
    
    const pdfBuffer = await generarActaPDFConFirmas(datosParaPDF, 'devolucion');

    enviarActaPorCorreo(pdfBuffer, nombreArchivo, 'devolucion', datosParaPDF.empleado).catch(err => {
        console.error("Fallo al enviar el correo de devolución:", err);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error en el proceso de devolución con firmas:", error);
    res.status(500).json({ error: "Error en el proceso de devolución con firmas", detalle: error.message });
  }
};

module.exports = {
  devolverEquipoYGenerarActa,
  devolverEquipoConFirmas,
};