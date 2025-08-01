const nodemailer = require('nodemailer');

const enviarActaPorCorreo = async (pdfBuffer, nombreArchivo, tipoActa, empleado) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "inventariocorasur@gmail.com",
      pass: process.env.EMAIL_PASS, 
    },
  });

  const esEntrega = tipoActa === 'entrega';
  const subjectText = esEntrega ? 'Acta de Entrega' : 'Acta de Devolución';
  const bodyText = esEntrega 
    ? 'Se adjunta el acta de entrega de equipo generada desde el sistema de inventario.'
    : 'Se adjunta el acta de devolución de equipo generada desde el sistema de inventario.';

  let correoEmpleado = null;
  if (empleado) {
    if (empleado.correo_institucional && empleado.correo_institucional.trim() !== "") {
      correoEmpleado = empleado.correo_institucional;
    } else if (empleado.correo_personal && empleado.correo_personal.trim() !== "") {
      correoEmpleado = empleado.correo_personal;
    }
  }

  const correosFijos = [
    "jbaez@corasur.com",
    "kaguayo@corasur.com"
  ];

  let destinatarios = correosFijos.join(", ");
  if (correoEmpleado) {
    destinatarios = correoEmpleado + ", " + destinatarios;
  }

  await transporter.sendMail({
    from: '"Inventario CORASUR" <inventariocorasur@gmail.com>',
    to: destinatarios,
    subject: `${subjectText} - ${nombreArchivo}`,
    text: bodyText,
    attachments: [
      {
        filename: nombreArchivo,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};

const enviarNotificacionSolicitud = async ({ empleado, estado, motivoRechazo = "" }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "inventariocorasur@gmail.com",
      pass: process.env.EMAIL_PASS, 
    },
  });

  let correoEmpleado = null;
  if (empleado) {
    if (empleado.correo_institucional && empleado.correo_institucional.trim() !== "") {
      correoEmpleado = empleado.correo_institucional.trim();
    } else if (empleado.correo_personal && empleado.correo_personal.trim() !== "") {
      correoEmpleado = empleado.correo_personal.trim();
    }
  }

  if (!correoEmpleado) return;

  const subjectText = estado === "aprobada"
    ? "Solicitud de equipo aprobada"
    : "Solicitud de equipo rechazada";

  let bodyText = estado === "aprobada"
    ? "Su solicitud de equipo ha sido aprobada. Pronto nos comunicaremos para la entrega."
    : `Su solicitud de equipo ha sido rechazada.\nMotivo: ${motivoRechazo}`;

  await transporter.sendMail({
    from: '"Inventario CORASUR" <inventariocorasur@gmail.com>',
    to: correoEmpleado,
    subject: subjectText,
    text: bodyText,
  });
};

module.exports = {
  enviarActaPorCorreo,
  enviarNotificacionSolicitud
};