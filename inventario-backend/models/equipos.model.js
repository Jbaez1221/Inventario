const db = require("../database");

const obtenerEquipos = async () => {
  const result = await db.query("SELECT * FROM equipos ORDER BY id");
  return result.rows;
};

const crearEquipo = async (equipo) => {
  let {
    tipo, marca, modelo, serie, fecha_ingreso,
    ubicacion, garantia, valor_compra, observaciones, equipo_url,
    memoria, almacenamiento
  } = equipo;

  fecha_ingreso = fecha_ingreso || null;
  garantia = garantia || null;
  valor_compra = valor_compra || null;

  const estadoCreacion = 'Disponible';

  const result = await db.query(
    `INSERT INTO equipos (
      tipo, marca, modelo, serie, fecha_ingreso,
      ubicacion, estado, valor_compra, observaciones, equipo_url,
      memoria, almacenamiento, garantia
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      tipo, marca, modelo, serie, fecha_ingreso, ubicacion, estadoCreacion, 
      valor_compra, observaciones, equipo_url, memoria, almacenamiento, garantia
    ]
  );

  return result.rows[0];
};

const obtenerEquiposDisponibles = async () => {
  const result = await db.query("SELECT * FROM equipos WHERE estado = 'Disponible'");
  return result.rows;
};

const obtenerEquiposAsignados = async () => {
  const result = await db.query("SELECT * FROM equipos WHERE estado = 'Asignado'");
  return result.rows;
};

const actualizarEquipo = async (id, equipo) => {
  let {
    tipo, marca, modelo, serie, fecha_ingreso,
    ubicacion, estado, garantia, valor_compra, observaciones, equipo_url,
    memoria, almacenamiento
  } = equipo;

  fecha_ingreso = fecha_ingreso || null;
  garantia = garantia || null;
  valor_compra = valor_compra || null;

  const result = await db.query(
    `UPDATE equipos SET
      tipo = $1, marca = $2, modelo = $3, serie = $4, fecha_ingreso = $5,
      ubicacion = $6, estado = $7, valor_compra = $8,
      observaciones = $9, equipo_url = $10, memoria = $11, almacenamiento = $12, garantia = $13
    WHERE id = $14 RETURNING *`,
    [
      tipo, marca, modelo, serie, fecha_ingreso, ubicacion, estado, 
      valor_compra, observaciones, equipo_url, memoria, almacenamiento, garantia, id
    ]
  );

  return result.rows[0];
};

const eliminarEquipo = async (id) => {
  await db.query("DELETE FROM equipos WHERE id = $1", [id]);
};

module.exports = {
  obtenerEquipos,
  crearEquipo,
  obtenerEquiposDisponibles,
  obtenerEquiposAsignados,
  actualizarEquipo,
  eliminarEquipo
};
