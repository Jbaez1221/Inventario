const PDFDocument = require("pdfkit");
const path = require('path');

function generarActaPDF(datos, tipoActa) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on("error", reject);


    const pageMargin = 50;
    const contentWidth = doc.page.width - pageMargin * 2;

    const headerY = 20;
    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

    doc.image(logoPath, pageMargin, headerY, { height: 40 });

    doc.moveDown(2.5);
    doc.font("Helvetica-Bold").fontSize(14).text(`ÁREA DE SISTEMAS 2025 - ${datos.numeroActa}`, pageMargin, doc.y, { width: contentWidth, align: 'center' });
    const tituloActa = tipoActa === 'entrega' ? 'ACTA DE ENTREGA DE EQUIPO INFORMÁTICO' : 'ACTA DE DEVOLUCIÓN DE EQUIPO INFORMÁTICO';
    doc.font("Helvetica-Bold").fontSize(12).text(tituloActa, { align: 'center' });

    doc.moveDown(1.5);
    const lineY = doc.y;
    doc.moveTo(pageMargin, lineY).lineTo(doc.page.width - pageMargin, lineY).stroke();

    let y = lineY + 25;
    const verbo = tipoActa === 'entrega' ? 'recibido' : 'devuelto';
    const nombreCompletoEmpleado = `${datos.empleado.nombres} ${datos.empleado.apellidos}`;
    const textoIntro = `Por medio del presente documento, yo ${nombreCompletoEmpleado} identificado con DNI N.° ${datos.empleado.dni}, colaborador de la empresa CORASUR S.A., dejo constancia de haber ${verbo} un equipo informático para el cumplimiento de las funciones y actividades asignadas por la empresa.`;
    doc.font("Helvetica").fontSize(11).text(textoIntro, pageMargin, y, { align: "justify", width: contentWidth });

    y += 70;
    const textoEquipo = tipoActa === 'entrega' ? 'Recibo un equipo con las siguientes características:' : 'Devuelvo un equipo con las siguientes características:';
    doc.font("Helvetica-Bold").text(textoEquipo, pageMargin, y);
    y += 25;

    const fila = (label, valor) => {
      doc.font("Helvetica-Bold").text(label, pageMargin + 10, y);
      doc.font("Helvetica").text(valor || "—", 170, y);
      y += 20;
    };

    fila("ID Equipo:", datos.equipo.id?.toString());
    fila("Equipo:", datos.equipo.tipo);
    fila("Marca:", datos.equipo.marca);
    fila("Modelo:", datos.equipo.modelo);
    fila("IMEI/Serie:", datos.equipo.serie);
    fila("Memoria:", datos.equipo.memoria);
    fila("Almacenamiento:", datos.equipo.almacenamiento);
    fila("Observaciones:", datos.observaciones || "—");

    y = doc.page.height - 150;
    const firmaWidth = 180;
    const firmaRecibeX = pageMargin + 20;
    const firmaDevuelveX = doc.page.width - pageMargin - firmaWidth - 20;

    doc.lineCap('butt').moveTo(firmaRecibeX, y).lineTo(firmaRecibeX + firmaWidth, y).stroke();
    doc.lineCap('butt').moveTo(firmaDevuelveX, y).lineTo(firmaDevuelveX + firmaWidth, y).stroke();

    y += 5;
    const firmaIzquierdaLabel = tipoActa === 'entrega' ? "Entrega" : "Recibe";
    const firmaDerechaLabel = tipoActa === 'entrega' ? "Recibe" : "Devuelve";

    doc.font("Helvetica").fontSize(10).text(firmaIzquierdaLabel, firmaRecibeX, y, { width: firmaWidth, align: 'center' });
    doc.text(firmaDerechaLabel, firmaDevuelveX, y, { width: firmaWidth, align: 'center' });

    y += 20;
    doc.text(`Nombre: JAYO E. BAEZ QUISPE`, firmaRecibeX, y);
    doc.text(`Nombre: ${nombreCompletoEmpleado}`, firmaDevuelveX, y);
    y += 15;
    doc.text(`DNI: 71422050`, firmaRecibeX, y);
    doc.text(`DNI: ${datos.empleado.dni}`, firmaDevuelveX, y);
    y += 15;
    const fecha = tipoActa === 'entrega' ? datos.fecha_entrega : datos.fecha_devolucion;
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-PE", { timeZone: 'America/Lima' });
    doc.text(`Fecha: ${fechaFormateada}`, firmaDevuelveX, y);

    doc.end();
  });
}

module.exports = { generarActaPDF };