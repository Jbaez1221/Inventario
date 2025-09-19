const pool = require("../database.js");

async function obtenerModelos() {
  const result = await pool.query("SELECT * FROM Modelo ORDER BY id_modelo");
  return result.rows;
}

async function obtenerModeloPorId(idModelo) {
  const result = await pool.query(
    "SELECT * FROM Modelo WHERE id_modelo = $1",
    [idModelo]
  );
  return result.rows[0];
}

async function obtenerModelosPorVehiculo(idVehiculo) {
  const result = await pool.query(
    "SELECT * FROM Modelo WHERE id_vehiculo = $1 ORDER BY id_modelo",
    [idVehiculo]
  );
  return result.rows;
}

async function crearModelo({ modelo, aplica, codigoModelo, idVehiculo, idEstado }) {
  const result = await pool.query(
    `INSERT INTO Modelo (modelo, aplica, codigo_modelo, id_vehiculo, id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [modelo, aplica, codigoModelo, idVehiculo, idEstado]
  );
  return result.rows[0];
}

async function actualizarModelo(idModelo, { modelo, aplica, codigoModelo, idVehiculo, idEstado }) {
  const result = await pool.query(
    `UPDATE Modelo
     SET modelo = $1, aplica = $2, codigo_modelo = $3, id_vehiculo = $4, id = $5
     WHERE id_modelo = $6
     RETURNING *`,
    [modelo, aplica, codigoModelo, idVehiculo, idEstado, idModelo]
  );
  return result.rows[0];
}

async function eliminarModelo(idModelo) {
  await pool.query("DELETE FROM Modelo WHERE id_modelo = $1", [idModelo]);
  return { message: "Modelo eliminado correctamente" };
}

module.exports = {
  obtenerModelos,
  obtenerModeloPorId,
  obtenerModelosPorVehiculo,
  crearModelo,
  actualizarModelo,
  eliminarModelo,
};
