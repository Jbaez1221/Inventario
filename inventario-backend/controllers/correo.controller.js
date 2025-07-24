const nodemailer = require("nodemailer");
const fs = require("fs");

const enviarActaPorCorreo = async (correoDestino, asunto, cuerpo, pathPDF) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
    user: process.env.CORREO_ORIGEN,
    pass: process.env.CORREO_PASS,
    },
  });

  const mailOptions = {
    from: '"CORASUR S.A" <jayobaez1221@gmail.com',
    to: correoDestino,
    subject: asunto,
    text: cuerpo,
    attachments: [
      {
        filename: "acta-entrega.pdf",
        path: pathPDF,
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
module.exports = {
  enviarActaPorCorreo,
};