const pool = require("../database.js");

async function obtenerMantenimientos() {
    const result = await pool.query("SELECT * FROM Mantenimiento ORDER BY id_mant");
    return result.rows;
}

async function obtenerMantenimientoPorId(id) {
    const result = await pool.query("SELECT * FROM Mantenimiento WHERE id_mant=$1", [id]);
    return result.rows[0];
}

async function crearMantenimiento({ descripcion, codigo, unidad, idTipmant, id }) {
    const result = await pool.query(
        `INSERT INTO Mantenimiento (descripcion, codigo, unidad, id_tipmant, id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [descripcion, codigo, unidad, idTipmant, id]
    );
    return result.rows[0];
}

async function actualizarMantenimiento(idMant, { descripcion, codigo, unidad, idTipmant, id }) {
    const result = await pool.query(
        `UPDATE Mantenimiento
     SET descripcion=$1, codigo=$2, unidad=$3, id_tipmant=$4, id=$5
     WHERE id_mant=$6 RETURNING *`,
        [descripcion, codigo, unidad, idTipmant, id, idMant]
    );
    return result.rows[0];
}

async function eliminarMantenimiento(idMant) {
    await pool.query("DELETE FROM Mantenimiento WHERE id_mant=$1", [idMant]);
    return { message: "Mantenimiento eliminado correctamente" };
}

module.exports = { obtenerMantenimientos, obtenerMantenimientoPorId, crearMantenimiento, actualizarMantenimiento, eliminarMantenimiento };
