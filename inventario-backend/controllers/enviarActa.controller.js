const nodemailer = require('nodemailer');

const enviarActaPorCorreo = async (req, res) => {
  // Correos fijos según tu requerimiento
  const to = "016201245D@uandina.edu.pe";
  const from = "robby863401@gmail.com";
  const subject = "Acta de Devolución de Equipo";
  const text = "Adjunto el acta de devolución de equipo.";

  // El PDF viene como archivo adjunto
  const pdfBuffer = req.file.buffer;
  const pdfName = req.file.originalname || 'acta.pdf';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: from,
        pass: process.env.EMAIL_PASS, // Debes poner la contraseña de aplicación aquí
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      attachments: [
        {
          filename: pdfName,
          content: pdfBuffer,
        },
      ],
    });

    res.status(200).json({ mensaje: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar correo', detalle: error.message });
  }
};

module.exports = { enviarActaPorCorreo };