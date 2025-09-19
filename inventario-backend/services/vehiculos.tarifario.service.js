const pool = require("../database.js");

async function obtenerVehiculos() {
  const result = await pool.query("SELECT * FROM Vehiculos ORDER BY id_vehiculo");
  return result.rows;
}

async function obtenerVehiculoPorId(idVehiculo) {
  const result = await pool.query(
    "SELECT * FROM Vehiculos WHERE id_vehiculo = $1",
    [idVehiculo]
  );
  return result.rows[0];
}

async function obtenerVehiculosPorSubida(idSubida) {
  const result = await pool.query(
    "SELECT * FROM Vehiculos WHERE id = $1 ORDER BY id_vehiculo",
    [idSubida]
  );
  return result.rows;
}

async function crearVehiculo({ vehiculo, idEstado }) {
  const result = await pool.query(
    `INSERT INTO Vehiculos (vehiculo, id)
     VALUES ($1, $2)
     RETURNING *`,
    [vehiculo, idEstado]
  );
  return result.rows[0];
}

async function actualizarVehiculo(idVehiculo, { vehiculo, idEstado }) {
  const result = await pool.query(
    `UPDATE Vehiculos
     SET vehiculo = $1, id = $2
     WHERE id_vehiculo = $3
     RETURNING *`,
    [vehiculo, idEstado, idVehiculo]
  );
  return result.rows[0];
}

async function eliminarVehiculo(idVehiculo) {
  await pool.query("DELETE FROM Vehiculos WHERE id_vehiculo = $1", [idVehiculo]);
  return { message: "Vehículo eliminado correctamente" };
}

module.exports = {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  obtenerVehiculosPorSubida,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
};
