const pool = require("../database.js");

async function obtenerSubidas() {
  const result = await pool.query("SELECT * FROM Subida ORDER BY id");
  return result.rows;
}

async function obtenerSubidaPorId(id) {
  const result = await pool.query("SELECT * FROM Subida WHERE id = $1", [id]);
  return result.rows[0];
}

async function crearSubida({ numero }) {
  const result = await pool.query(
    `INSERT INTO Subida (numero) 
     VALUES ($1) 
     RETURNING *`,
    [numero]
  );
  return result.rows[0];
}

async function actualizarSubida(id, { numero }) {
  const result = await pool.query(
    `UPDATE Subida
     SET numero = $1
     WHERE id = $2
     RETURNING *`,
    [numero, id]
  );
  return result.rows[0];
}

async function eliminarSubida(id) {
  await pool.query("DELETE FROM Subida WHERE id = $1", [id]);
  return { message: "Subida eliminada correctamente" };
}

module.exports = {
  obtenerSubidas,
  obtenerSubidaPorId,
  crearSubida,
  actualizarSubida,
  eliminarSubida,
};