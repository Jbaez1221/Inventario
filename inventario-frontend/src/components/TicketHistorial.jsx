import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketHistorial({ ticketId, onClose }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:4002/tickets/${ticketId}/historial`, { withCredentials: true })
      .then(res => setHistorial(res.data));
  }, [ticketId]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h3>Historial del Ticket</h3>
        <ul>
          {historial.map(h => (
            <li key={h.id}>
              <b>{h.fecha}:</b> {h.accion} - {h.detalle} {h.nombres && `(${h.nombres} ${h.apellidos})`}
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}