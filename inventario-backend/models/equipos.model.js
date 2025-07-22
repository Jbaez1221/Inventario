const db = require("../database");

// Obtener todos los equipos
const obtenerEquipos = async () => {
  const result = await db.query("SELECT * FROM equipos ORDER BY id");
  return result.rows;
};

// Crear un nuevo equipo
const crearEquipo = async (equipo) => {
  const {
    tipo, marca, modelo, serie, fecha_ingreso,
    ubicacion, estado, garantia_fin, valor_compra, observaciones
  } = equipo;

  const result = await db.query(
    `INSERT INTO equipos (
      tipo, marca, modelo, serie, fecha_ingreso,
      ubicacion, estado, garantia_fin, valor_compra, observaciones
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [tipo, marca, modelo, serie, fecha_ingreso, ubicacion, estado, garantia_fin, valor_compra, observaciones]
  );

  return result.rows[0];
};

// Obtener equipos disponibles
const obtenerEquiposDisponibles = async () => {
  const result = await db.query("SELECT * FROM equipos WHERE estado = 'Disponible'");
  return result.rows;
};

// Obtener equipos asignados
const obtenerEquiposAsignados = async () => {
  const result = await db.query("SELECT * FROM equipos WHERE estado = 'Asignado'");
  return result.rows;
};

// Actualizar equipo
const actualizarEquipo = async (id, equipo) => {
  const {
    tipo, marca, modelo, serie, fecha_ingreso,
    ubicacion, estado, garantia_fin, valor_compra, observaciones
  } = equipo;

  const result = await db.query(
    `UPDATE equipos SET
      tipo = $1,
      marca = $2,
      modelo = $3,
      serie = $4,
      fecha_ingreso = $5,
      ubicacion = $6,
      estado = $7,
      garantia_fin = $8,
      valor_compra = $9,
      observaciones = $10
    WHERE id = $11 RETURNING *`,
    [tipo, marca, modelo, serie, fecha_ingreso, ubicacion, estado, garantia_fin, valor_compra, observaciones, id]
  );

  return result.rows[0];
};

// Eliminar equipo
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
