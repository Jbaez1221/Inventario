const db = require("../database");

const guardarActa = async (acta) => {
  const {
    numero_acta,
    empleado_nombre,
    dni,
    equipo_id,
    tipo,
    marca,
    modelo,
    serie,
    observaciones,
    fecha_entrega,
    pdf_url // opcional
  } = acta;

  const result = await db.query(
    `INSERT INTO actas (
      numero_acta, empleado_nombre, dni, equipo_id, tipo, marca, modelo,
      serie, observaciones, fecha_entrega, pdf_url
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [numero_acta, empleado_nombre, dni, equipo_id, tipo, marca, modelo,
     serie, observaciones, fecha_entrega, pdf_url]
  );

  return result.rows[0];
};
module.exports = {
  guardarActa,
};