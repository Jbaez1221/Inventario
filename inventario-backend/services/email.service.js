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

const enviarNotificacionTicketAsignado = async ({ tecnico, ticket }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "inventariocorasur@gmail.com",
      pass: process.env.EMAIL_PASS, 
    },
  });

  let correo = tecnico.correo_institucional || tecnico.correo_personal;
  if (!correo) return;
  await transporter.sendMail({
    from: '"Inventario CORASUR" <inventario@corasur.com>',
    to: correo,
    subject: `Nuevo ticket asignado: ${ticket.codigo}`,
    text: `Se te ha asignado el ticket ${ticket.codigo}.\nPrioridad: ${ticket.prioridad}\nDescripción: ${ticket.observacion_inicial || "Sin descripción"}`
  });
};

const enviarNotificacionComentarioAsignacion = async ({ solicitante, ticket, comentario }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "inventariocorasur@gmail.com",
      pass: process.env.EMAIL_PASS, 
    },
  });

  let correo = solicitante.correo_institucional || solicitante.correo_personal;
  if (!correo) return;
  await transporter.sendMail({
    from: '"Inventario CORASUR" <inventariocorasur@gmail.com>',
    to: correo,
    subject: `Comentario sobre tu ticket ${ticket.codigo}`,
    text: `Comentario del área de soporte:\n${comentario}\n\nTicket: ${ticket.codigo}\nEstado: ${ticket.estado}`
  });
};

module.exports = {
  enviarActaPorCorreo,
  enviarNotificacionSolicitud,
  enviarNotificacionTicketAsignado,
  enviarNotificacionComentarioAsignacion
};