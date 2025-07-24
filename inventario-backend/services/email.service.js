const nodemailer = require('nodemailer');

const enviarActaPorCorreo = async (pdfBuffer, nombreArchivo, tipoActa) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "jbaez@corasur.com",
      pass: process.env.EMAIL_PASS, 
    },
  });

  const esEntrega = tipoActa === 'entrega';
  const subjectText = esEntrega ? 'Acta de Entrega' : 'Acta de Devolución';
  const bodyText = esEntrega 
    ? 'Se adjunta el acta de entrega de equipo generada desde el sistema de inventario.'
    : 'Se adjunta el acta de devolución de equipo generada desde el sistema de inventario.';

  await transporter.sendMail({
    from: '"Inventario CORASUR" <jbaez@corasur.com>',
    to: "jayobaez1221@gmail.com",
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
  console.log('Correo enviado exitosamente.');
};

module.exports = { enviarActaPorCorreo };