const pool = require("../database.js");

async function obtenerTipos() {
    const result = await pool.query("SELECT * FROM TipoMantenimiento ORDER BY id_tipmant");
    return result.rows;
}

async function obtenerTipoPorId(id) {
    const result = await pool.query("SELECT * FROM TipoMantenimiento WHERE id_tipmant = $1", [id]);
    return result.rows[0];
}

async function crearTipo({ tipo, id }) {
    const result = await pool.query(
        "INSERT INTO TipoMantenimiento (tipo, id) VALUES ($1, $2) RETURNING *",
        [tipo, id]
    );
    return result.rows[0];
}

async function actualizarTipo(idTip, { tipo, id }) {
    const result = await pool.query(
        "UPDATE TipoMantenimiento SET tipo=$1, id=$2 WHERE id_tipmant=$3 RETURNING *",
        [tipo, id, idTip]
    );
    return result.rows[0];
}

async function eliminarTipo(idTip) {
    await pool.query("DELETE FROM TipoMantenimiento WHERE id_tipmant=$1", [idTip]);
    return { message: "Tipo eliminado correctamente" };
}

module.exports = { obtenerTipos, obtenerTipoPorId, crearTipo, actualizarTipo, eliminarTipo };
