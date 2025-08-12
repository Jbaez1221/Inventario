import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";

export default function TicketHistorial({ ticketId, onClose }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        const res = await axiosBackend.get(`/tickets/${ticketId}/historial`);
        setHistorial(res.data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [ticketId]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h3>Historial del Ticket</h3>
        
        {loading ? (
          <p>Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p>No hay registros en el historial</p>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {historial.map(h => (
              <div key={h.id} style={{ 
                borderBottom: '1px solid #333', 
                padding: '10px 0',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.9em', color: '#bbb' }}>
                  {formatearFecha(h.fecha)}
                </div>
                <div style={{ fontWeight: 'bold', margin: '4px 0' }}>
                  {h.accion}
                </div>
                <div style={{ margin: '4px 0' }}>
                  {h.detalle}
                </div>
                {h.nombres && (
                  <div style={{ fontSize: '0.9em', color: '#8ab4f8' }}>
                    Por: {h.nombres} {h.apellidos}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}