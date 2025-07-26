const db = require("../database");

const obtenerEquipos = async () => {
  const result = await db.query("SELECT * FROM equipos ORDER BY id");
  return result.rows;
};

const crearEquipo = async (equipo) => {
  let {
    tipo, marca, modelo, serie, fecha_ingreso,
    ubicacion, garantia_fin, valor_compra, observaciones, equipo_url,
    memoria, almacenamiento
  } = equipo;

  fecha_ingreso = fecha_ingreso || null;
  garantia_fin = garantia_fin || null;
  valor_compra = valor_compra || null;

  const estadoCreacion = 'Disponible';

  const result = await db.query(
    `INSERT INTO equipos (
      tipo, marca, modelo, serie, fecha_ingreso,
      ubicacion, estado, garantia_fin, valor_compra, observaciones, equipo_url,
      memoria, almacenamiento
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      tipo, marca, modelo, serie, fecha_ingreso, ubicacion, estadoCreacion, 
      garantia_fin, valor_compra, observaciones, equipo_url, memoria, almacenamiento
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
    ubicacion, estado, garantia_fin, valor_compra, observaciones, equipo_url,
    memoria, almacenamiento
  } = equipo;

  fecha_ingreso = fecha_ingreso || null;
  garantia_fin = garantia_fin || null;
  valor_compra = valor_compra || null;

  const result = await db.query(
    `UPDATE equipos SET
      tipo = $1, marca = $2, modelo = $3, serie = $4, fecha_ingreso = $5,
      ubicacion = $6, estado = $7, garantia_fin = $8, valor_compra = $9,
      observaciones = $10, equipo_url = $11, memoria = $12, almacenamiento = $13
    WHERE id = $14 RETURNING *`,
    [
      tipo, marca, modelo, serie, fecha_ingreso, ubicacion, estado, 
      garantia_fin, valor_compra, observaciones, equipo_url, memoria, almacenamiento, id
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
