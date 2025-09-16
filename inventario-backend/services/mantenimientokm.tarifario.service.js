const pool = require("../database.js");

async function obtenerMantenimientosKm() {
    const result = await pool.query(`
    SELECT mk.id_mantKm, mk.precio,
           m.descripcion, m.codigo, m.unidad,
           km.valor AS kilometraje,
           mo.modelo, mo.codigo_modelo,
           tm.tipo
    FROM MantenimientoKm mk
    JOIN Mantenimiento m ON mk.id_mant = m.id_mant
    JOIN Kilometraje km ON mk.id_km = km.id_km
    JOIN Modelo mo ON mk.id_modelo = mo.id_modelo
    JOIN TipoMantenimiento tm ON m.id_tipmant = tm.id_tipmant
    ORDER BY mk.id_mantKm
  `);
    return result.rows;
}

async function obtenerMantenimientoKmPorId(id) {
    const result = await pool.query(
        `SELECT * FROM MantenimientoKm WHERE id_mantKm=$1`,
        [id]
    );
    return result.rows[0];
}

async function crearMantenimientoKm({ precio, idMant, idModelo, idKm, id }) {
    const result = await pool.query(
        `INSERT INTO MantenimientoKm (precio, id_mant, id_modelo, id_km, id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [precio, idMant, idModelo, idKm, id]
    );
    return result.rows[0];
}

async function actualizarMantenimientoKm(idMantKm, { precio, idMant, idModelo, idKm, id }) {
    const result = await pool.query(
        `UPDATE MantenimientoKm
     SET precio=$1, id_mant=$2, id_modelo=$3, id_km=$4, id=$5
     WHERE id_mantKm=$6 RETURNING *`,
        [precio, idMant, idModelo, idKm, id, idMantKm]
    );
    return result.rows[0];
}

async function eliminarMantenimientoKm(idMantKm) {
    await pool.query("DELETE FROM MantenimientoKm WHERE id_mantKm=$1", [idMantKm]);
    return { message: "Registro eliminado correctamente" };
}

async function obtenerTarifarioPorModelo(idModelo) {
    const client = await pool.connect();
    try {
        // 1) Modelo
        const modeloRes = await client.query(
            `SELECT id_modelo, modelo, codigo_modelo
       FROM Modelo
       WHERE id_modelo = $1`,
            [idModelo]
        );
        const modelo = modeloRes.rows[0];
        if (!modelo) return null;

        // 2) Kilometrajes distintos para ese modelo (orden numérico “natural” cuando sea posible)
        const kmsRes = await client.query(
            `
  SELECT km.valor
  FROM MantenimientoKm mk
  JOIN Kilometraje km ON km.id_km = mk.id_km
  WHERE mk.id_modelo = $1
  GROUP BY km.valor
  ORDER BY NULLIF(regexp_replace(km.valor, '[^0-9]', '', 'g'), '')::int NULLS LAST,
           km.valor ASC
  `,
            [idModelo]
        );
        const kilometrajes = kmsRes.rows.map(r => r.valor);

        // 3) Todas las filas (mant, tipo, km, precio)
        const rowsRes = await client.query(
            `SELECT 
          m.id_mant, m.descripcion, m.codigo, m.unidad,
          tm.tipo,
          km.valor AS km,
          mk.precio
       FROM Mantenimiento m
       JOIN TipoMantenimiento tm ON tm.id_tipmant = m.id_tipmant
       JOIN MantenimientoKm mk ON mk.id_mant = m.id_mant
       JOIN Kilometraje km ON km.id_km = mk.id_km
      WHERE mk.id_modelo = $1
      ORDER BY tm.tipo, m.id_mant,
               NULLIF(regexp_replace(km.valor, '[^0-9]', '', 'g'), '')::int NULLS LAST,
               km.valor ASC`,
            [idModelo]
        );
        const rows = rowsRes.rows;

        // 4) Pivot en JS
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.id_mant)) {
                map.set(r.id_mant, {
                    id_mant: r.id_mant,
                    tipo: r.tipo,
                    descripcion: r.descripcion,
                    codigo: r.codigo,
                    unidad: r.unidad,
                    precios: {}
                });
            }
            const item = map.get(r.id_mant);
            item.precios[r.km] = r.precio !== null ? Number(r.precio) : null;
        }

        return {
            modelo,
            kilometrajes,
            items: Array.from(map.values())
        };
    } catch (err) {
        console.error("[obtenerTarifarioPorModelo] Error:", err); // 👈 log útil
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { obtenerMantenimientosKm, obtenerMantenimientoKmPorId, crearMantenimientoKm, actualizarMantenimientoKm, eliminarMantenimientoKm, obtenerTarifarioPorModelo };
