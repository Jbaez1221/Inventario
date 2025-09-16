import { useState } from "react";
import axiosBackend from "../../api/axios";

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
      const res = await axiosBackend.get("/tickets/publico/buscar-por-codigo", {
        params: { codigo }
      });
      setResultado(res.data);
    } catch{
      setResultado({ error: "No se encontró el ticket o el código es incorrecto." });
    }
    setBuscando(false);
  };

  const handleBuscarPorDni = async e => {
    e.preventDefault();
    setResultado(null);
    setBuscando(true);
    try {
      const res = await axiosBackend.get("/tickets/publico/buscar-por-dni", {
        params: { dni }
      });
      
      if (!res.data || res.data.length === 0) {
        setResultado({ error: "No se encontraron tickets para ese DNI." });
      } else {
        const ticketsNoCerrados = res.data.filter(t => t.estado !== "Cerrado");
        setResultado(ticketsNoCerrados);
      }
    } catch{
      setResultado({ error: "Error al buscar tickets. Verifique el DNI." });
    }
    setBuscando(false);
  };

  return (
    <div className="consulta-ticket-container">
      <div className="consulta-ticket-header">
        <h2>Consultar Estado de Ticket</h2>
        <p>Ingrese el código del ticket o su DNI para consultar el estado</p>
      </div>
      
      <div className="consulta-forms-grid">
        <div className="consulta-form-card">
          <h3>Buscar por Código</h3>
          <form onSubmit={handleBuscarPorCodigo}>
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="TCK-CORASUR-2025-00001"
              required
            />
            <button type="submit" className="btn-primary" disabled={buscando}>
              {buscando ? "Buscando..." : "Buscar Ticket"}
            </button>
          </form>
        </div>
        
        <div className="consulta-form-card">
          <h3>Buscar por DNI</h3>
          <form onSubmit={handleBuscarPorDni}>
            <input
              type="text"
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder="12345678"
              required
            />
            <button type="submit" className="btn-primary" disabled={buscando}>
              {buscando ? "Buscando..." : "Mis Tickets"}
            </button>
          </form>
        </div>
      </div>

      {resultado && (
        <div className="consulta-results">
          {resultado.error ? (
            <div className="consulta-error">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{resultado.error}</div>
            </div>
          ) : Array.isArray(resultado) ? (
            resultado.length === 0 ? (
              <div className="consulta-info">
                <div className="info-icon">ℹ️</div>
                <div className="info-text">No tiene tickets pendientes. Todos sus tickets están cerrados.</div>
              </div>
            ) : (
              <div className="tickets-encontrados">
                <div className="tickets-header">
                  <h3>Tickets Encontrados</h3>
                  <span className="tickets-count">{resultado.length}</span>
                </div>
                <div className="tickets-list">
                  {resultado.map(t => (
                    <div key={t.codigo} className="ticket-item">
                      <div className="ticket-item-header">
                        <span className="ticket-item-code">{t.codigo}</span>
                        <span className={`ticket-item-estado ${t.estado.toLowerCase().replace(' ', '-')}`}>
                          {t.estado}
                        </span>
                      </div>
                      <div className="ticket-item-details">
                        <div className="detail-row">
                          <span className="detail-label">Categoría:</span>
                          <span className="detail-value">{t.categoria}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Tipo:</span>
                          <span className="detail-value">{t.tipo}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Prioridad:</span>
                          <span className="detail-value">{t.prioridad}</span>
                        </div>
                        <div className="detail-row full">
                          <span className="detail-label">Descripción:</span>
                          <span className="detail-value">{t.observacion_inicial}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Fecha:</span>
                          <span className="detail-value">
                            {new Date(t.fecha_creacion).toLocaleDateString('es-ES')} - {new Date(t.fecha_creacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="tickets-encontrados">
              <div className="tickets-header">
                <h3>Ticket Encontrado</h3>
              </div>
              <div className="tickets-list">
                <div className="ticket-item">
                  <div className="ticket-item-header">
                    <span className="ticket-item-code">{resultado.codigo}</span>
                    <span className={`ticket-item-estado ${resultado.estado?.toLowerCase().replace(' ', '-')}`}>
                      {resultado.estado}
                    </span>
                  </div>
                  <div className="ticket-item-details">
                    <div className="detail-row">
                      <span className="detail-label">Categoría:</span>
                      <span className="detail-value">{resultado.categoria}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tipo:</span>
                      <span className="detail-value">{resultado.tipo}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Prioridad:</span>
                      <span className="detail-value">{resultado.prioridad}</span>
                    </div>
                    <div className="detail-row full">
                      <span className="detail-label">Descripción:</span>
                      <span className="detail-value">{resultado.observacion_inicial}</span>
                    </div>
                    {resultado.fecha_creacion && (
                      <div className="detail-row">
                        <span className="detail-label">Fecha:</span>
                        <span className="detail-value">
                          {new Date(resultado.fecha_creacion).toLocaleDateString('es-ES')} - {new Date(resultado.fecha_creacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {resultado.solucion_aplicada && (
                      <div className="detail-row full">
                        <span className="detail-label">Solución:</span>
                        <span className="detail-value solution">{resultado.solucion_aplicada}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}