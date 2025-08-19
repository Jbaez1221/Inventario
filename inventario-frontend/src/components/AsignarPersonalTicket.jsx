import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function AsignarPersonalTicket({ ticketId, onAsignado, modal = false, onClose }) {
  const [personal, setPersonal] = useState([]);
  const [personalId, setPersonalId] = useState("");

  useEffect(() => {
    axios.get("/tickets/empleados/sistemas")
      .then(res => setPersonal(res.data));
  }, []);

  const handleAsignar = async e => {
    e.preventDefault();
    await axios.put(`/tickets/${ticketId}/asignar`, { personalId });
    onAsignado();
    if (modal && onClose) onClose();
  };

  if (modal) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: 400 }}>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
          <h3>Asignar Responsable</h3>
          <form onSubmit={handleAsignar}>
            <select value={personalId} onChange={e => setPersonalId(e.target.value)} required>
              <option value="">Seleccione personal</option>
              {personal.map(p => (
                <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button type="submit" className="btn-primary">Asignar</button>
              <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleAsignar} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select value={personalId} onChange={e => setPersonalId(e.target.value)} required>
        <option value="">Seleccione personal</option>
        {personal.map(p => (
          <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>
        ))}
      </select>
      <button type="submit" className="btn-primary">Asignar</button>
    </form>
  );
}