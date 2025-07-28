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

    doc.image(logoPath, pageMargin, headerY, { width: 120 });

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
    if (tipoActa === 'devolucion' && datos.observacion_devolucion) {
      doc.font("Helvetica-Bold").text("Observación de devolución:", pageMargin + 10, y);
      y += 18;
      const obsDevY = doc.font("Helvetica").text(
        datos.observacion_devolucion || "—",
        pageMargin + 10,
        y,
        { width: contentWidth - 20, align: "justify" }
      ).y;
      y = obsDevY + 10;
    }

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

function generarActaPDFConFirmas(datos, tipoActa) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageMargin = 50;
    const contentWidth = doc.page.width - pageMargin * 2;

    const headerY = 20;
    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

    doc.image(logoPath, pageMargin, headerY, { width: 120 });

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
    if (tipoActa === 'devolucion' && datos.observacion_devolucion) {
      doc.font("Helvetica-Bold").text("Observación de devolución:", pageMargin + 10, y);
      y += 18; // Espacio debajo de la etiqueta
      const obsDevY = doc.font("Helvetica").text(
        datos.observacion_devolucion || "—",
        pageMargin + 10,
        y,
        { width: contentWidth - 20, align: "justify" }
      ).y;
      y = obsDevY + 10;
    }

    let firmaY = doc.page.height - 150;
    const firmaWidth = 180;
    const firmaHeight = 80;
    const firmaIzquierdaX = doc.page.width / 4 - firmaWidth / 2 + 20;
    const firmaDerechaX = (doc.page.width * 3) / 4 - firmaWidth / 2 - 20;

    const esEntrega = tipoActa === 'entrega';
    const firmaIzquierdaBuffer = Buffer.from((esEntrega ? datos.firmaEntrega : datos.firmaRecibe).split(',')[1], 'base64');
    const firmaDerechaBuffer = Buffer.from((esEntrega ? datos.firmaRecibe : datos.firmaDevuelve).split(',')[1], 'base64');
    
    const firmaIzquierdaLabel = esEntrega ? "Entrega (TI)" : "Recibe (TI)";
    const firmaDerechaLabel = esEntrega ? "Recibe (Empleado)" : "Devuelve (Empleado)";

    doc.image(firmaIzquierdaBuffer, firmaIzquierdaX, firmaY - firmaHeight, { fit: [firmaWidth, firmaHeight] });
    doc.image(firmaDerechaBuffer, firmaDerechaX, firmaY - firmaHeight, { fit: [firmaWidth, firmaHeight] });

    doc.lineCap('butt').moveTo(firmaIzquierdaX, firmaY).lineTo(firmaIzquierdaX + firmaWidth, firmaY).stroke();
    doc.lineCap('butt').moveTo(firmaDerechaX, firmaY).lineTo(firmaDerechaX + firmaWidth, firmaY).stroke();
    
    firmaY += 5;
    doc.font("Helvetica").fontSize(10).text(firmaIzquierdaLabel, firmaIzquierdaX, firmaY, { width: firmaWidth, align: 'center' });
    doc.text(firmaDerechaLabel, firmaDerechaX, firmaY, { width: firmaWidth, align: 'center' });
    
    firmaY += 15;
    doc.text(`Nombre: JAYO E. BAEZ QUISPE`, firmaIzquierdaX, firmaY);
    doc.text(`Nombre: ${datos.empleado.nombres} ${datos.empleado.apellidos}`, firmaDerechaX, firmaY);
    firmaY += 15;
    doc.text(`DNI: 71422050`, firmaIzquierdaX, firmaY);
    doc.text(`DNI: ${datos.empleado.dni}`, firmaDerechaX, firmaY);

    doc.end();
  });
}

module.exports = { 
  generarActaPDF,
  generarActaPDFConFirmas
};