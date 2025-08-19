import { useState } from "react";
import axiosBackend from "../api/axios";

const TIPOS = [
  "Incidencia",
  "Consulta",
  "Mantenimiento"
];

const CATEGORIAS = [
  "SAP",
  "Office",
  "Soporte Tecnico",
  "Contraseñas",
  "Internet",
  "Catologo Toyota",
  "Catologo Hino",
  "Reportes",
  "Camaras"
];

export default function BuscarSolucionesTickets() {
  const [filtros, setFiltros] = useState({ categoria: "", tipo: "", palabra: "" });
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const handleChange = e => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const handleBuscar = async e => {
    e.preventDefault();
    setBuscando(true);
    try {
      const params = {};
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.palabra.trim()) params.palabra = filtros.palabra.trim();

      const res = await axiosBackend.get("/tickets/publico/buscar", { params });
      setResultados(res.data);
    } catch (error) {
      console.error("Error al buscar tickets:", error);
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ categoria: "", tipo: "", palabra: "" });
    setResultados([]);
  };

  return (
    <div>
      <h2>Buscar Soluciones de Tickets Cerrados</h2>
      <p className="dashboard-subtitle">
        Encuentra soluciones de tickets anteriores. Puedes usar uno o varios filtros.
      </p>
      
      <form onSubmit={handleBuscar} className="buscar-soluciones-form">
        <div className="filtros-row">
          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={filtros.categoria}
              onChange={handleChange}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleChange}
            >
              <option value="">Todos los tipos</option>
              {TIPOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Palabra clave</label>
            <input
              type="text"
              name="palabra"
              placeholder="Buscar en soluciones..."
              value={filtros.palabra}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="botones-row">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={buscando}
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>

          <button 
            type="button" 
            className="btn-secondary"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </div>
      </form>

      {resultados.length > 0 && (
        <div className="search-results-count">
          Se encontraron {resultados.length} ticket(s) cerrado(s)
        </div>
      )}

      <div className="tabla-container">
        {resultados.length === 0 && !buscando ? (
          <div className="empty-state">
            <p>Use los filtros para buscar tickets cerrados con soluciones</p>
          </div>
        ) : (
          <div className="tickets-grid">
            {resultados.map(t => (
              <div key={t.codigo} className="card">
                <div className="card-header">
                  <div className="ticket-info">
                    <span className="ticket-code">{t.codigo}</span>
                    <span className="ticket-status">{t.estado}</span>
                  </div>
                  <div className="ticket-meta">
                    {t.categoria} • {t.tipo}
                  </div>
                </div>
                <div>
                  <div className="solution-label">Solución aplicada:</div>
                  <div className="solution-text">
                    {t.solucion || "Sin solución registrada"}
                  </div>
                  {t.solucionado_por && (
                    <div className="solution-author">
                      <strong>Resuelto por:</strong> {t.solucionado_por}
                      {t.correo_tecnico && (
                        <span style={{marginLeft:8, fontSize:'0.9em', color:'var(--accent-info)'}}>
                          ({t.correo_tecnico})
                        </span>
                      )}
                    </div>
                  )}
                  {t.fecha_cierre && (
                    <div className="solution-date">
                      <strong>Fecha de resolución:</strong> {new Date(t.fecha_cierre).toLocaleDateString('es-ES')} - {new Date(t.fecha_cierre).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {t.anydesk_info && (
                    <div className="anydesk-info">
                      <strong>🖥️ Soporte remoto:</strong> Se utilizó AnyDesk (ID: {t.anydesk_info})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {buscando && (
        <div className="loading-state">
          Buscando tickets...
        </div>
      )}
    </div>
  );
}