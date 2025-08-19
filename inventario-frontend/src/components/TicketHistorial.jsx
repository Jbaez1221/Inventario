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
              <div key={h.id} className="historial-item">
                <div className="historial-fecha">
                  {formatearFecha(h.fecha)}
                </div>
                <div className="historial-accion">
                  {h.accion}
                </div>
                <div className="historial-detalle">
                  {h.detalle}
                </div>
                {h.nombres && (
                  <div className="historial-autor">
                    Por: {h.nombres} {h.apellidos}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}