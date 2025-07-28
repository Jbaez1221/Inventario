const nodemailer = require('nodemailer');

const enviarActaPorCorreo = async (pdfBuffer, nombreArchivo, tipoActa, empleado) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "robby863401@gmail.com",
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
    "jayobaez1221@gmail.com",
    "016201245D@uandina.edu.pe"
  ];

  let destinatarios = correosFijos.join(", ");
  if (correoEmpleado) {
    destinatarios = correoEmpleado + ", " + destinatarios;
  }

  await transporter.sendMail({
    from: '"Inventario CORASUR" <robby863401@gmail.com>',
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

module.exports = { enviarActaPorCorreo };