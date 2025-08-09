import { useState } from "react";
import axios from "../api/axios";

export default function EstadoTicketPublico() {
  const [codigo, setCodigo] = useState("");
  const [dni, setDni] = useState("");
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const handleBuscarPorCodigo = async e => {
    e.preventDefault();
    setResultado(null);
    setBuscando(true);
    try {
      const res = await axios.get("/tickets/publico/buscar-por-codigo", {
        params: { codigo }
      });
      setResultado(res.data);
    } catch {
      setResultado({ error: "No se encontró el ticket o el código es incorrecto." });
    }
    setBuscando(false);
  };

  const handleBuscarPorDni = async e => {
    e.preventDefault();
    setResultado(null);
    setBuscando(true);
    try {
      const res = await axios.get("/tickets/publico/buscar-por-dni", {
        params: { dni }
      });
      const ticketsNoCerrados = (res.data || []).filter(t => t.estado !== "Cerrado");
      setResultado(ticketsNoCerrados);
    } catch {
      setResultado({ error: "No se encontraron tickets para ese DNI." });
    }
    setBuscando(false);
  };

  return (
    <div className="formulario" style={{ maxWidth: 500 }}>
      <h2>Consultar Estado de Ticket</h2>
      <form onSubmit={handleBuscarPorCodigo} style={{ marginBottom: 16 }}>
        <input
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          placeholder="Código de Ticket"
          required
        />
        <button type="submit" className="btn-primary" disabled={buscando}>Buscar por Código</button>
      </form>
      <form onSubmit={handleBuscarPorDni}>
        <input
          value={dni}
          onChange={e => setDni(e.target.value)}
          placeholder="DNI"
          required
        />
        <button type="submit" className="btn-primary" disabled={buscando}>Buscar por DNI</button>
      </form>
      {resultado && (
        <div style={{ marginTop: 16 }}>
          {resultado.error ? (
            <span style={{ color: "red" }}>{resultado.error}</span>
          ) : Array.isArray(resultado) ? (
            resultado.length === 0 ? (
              <span>No hay tickets en proceso para este DNI.</span>
            ) : (
              resultado.map(t => (
                <div key={t.codigo} style={{ marginBottom: 12, borderBottom: "1px solid #444" }}>
                  <div><b>Código:</b> {t.codigo}</div>
                  <div><b>Estado:</b> {t.estado}</div>
                  <div><b>Prioridad:</b> {t.prioridad}</div>
                  <div><b>Categoría:</b> {t.categoria}</div>
                  <div><b>Descripción:</b> {t.descripcion}</div>
                </div>
              ))
            )
          ) : (
            <>
              <div><b>Código:</b> {resultado.codigo}</div>
              <div><b>Estado:</b> {resultado.estado}</div>
              <div><b>Prioridad:</b> {resultado.prioridad}</div>
              <div><b>Categoría:</b> {resultado.categoria}</div>
              <div><b>Descripción:</b> {resultado.descripcion}</div>
              {resultado.solucion_aplicada && (
                <div>
                  <b>Solución:</b>
                  <div>{resultado.solucion_aplicada}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}