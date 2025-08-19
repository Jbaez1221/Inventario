import { useState, useEffect, useCallback } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import TicketHistorial from "../components/TicketHistorial";
import AsignarPersonalTicket from "../components/AsignarPersonalTicket";

export default function TicketDetalle({ ticket, onClose, onUpdate }) {
  const { user } = useAuth();
  const [detalle, setDetalle] = useState(ticket);
  const [comentario, setComentario] = useState("");
  const [solucion, setSolucion] = useState("");
  const [showHistorial, setShowHistorial] = useState(false);

  const refrescarTicket = useCallback(async () => {
    try {
      const res = await axiosBackend.get(`/tickets/${ticket.id}`);
      setDetalle(res.data);
    } catch (error) {
      console.error("Error al refrescar ticket:", error);
    }
  }, [ticket.id]);

  useEffect(() => {
    refrescarTicket();
  }, [refrescarTicket]);

  const esTecnicoAsignado =
    user?.user?.rol === "tecnico sistemas" &&
    detalle.personal_asignado_id === user.user.empleado_id;

  const guardarComentario = async () => {
    try {
      await axiosBackend.put(`/tickets/${detalle.id}/asignar`, {
        personalId: detalle.personal_asignado_id,
        comentarios: comentario
      });
      await refrescarTicket();
      setComentario("");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al guardar comentario:", error);
    }
  };

  const cerrarTicket = async () => {
    try {
      await axiosBackend.put(`/tickets/${detalle.id}/estado`, {
        estado: "Cerrado",
        solucion_aplicada: solucion
      });
      await refrescarTicket();
      setSolucion("");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al cerrar ticket:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h3>Detalle del Ticket</h3>
        <div><b>Código:</b> {detalle.codigo}</div>
        <div><b>Estado:</b> {detalle.estado}</div>
        <div><b>Solicitante:</b> {detalle.solicitante_nombres} {detalle.solicitante_apellidos}</div>
        <div><b>Prioridad:</b> {detalle.prioridad}</div>
        <div>
          <b>Asignado a:</b>{" "}
          {detalle.asignado_nombres
            ? `${detalle.asignado_nombres} ${detalle.asignado_apellidos}`
            : "Sin asignar"}
        </div>
        <div><b>Descripción:</b> {detalle.observacion_inicial}</div>
        {detalle.anydesk_info && (
          <div className="anydesk-detail">
            <b>🖥️ AnyDesk del usuario:</b> 
            <span className="anydesk-code">{detalle.anydesk_info}</span>
            <small style={{display: 'block', marginTop: '4px', color: 'var(--text-muted)'}}>
              Puedes usar este ID para conectarte remotamente
            </small>
          </div>
        )}
        {(user?.user?.rol === "sistemas" || user?.user?.rol === "admin") &&
          !detalle.personal_asignado_id && (
            <div style={{ margin: "12px 0" }}>
              <AsignarPersonalTicket
                ticketId={detalle.id}
                onAsignado={async () => {
                  await refrescarTicket();
                  if (onUpdate) onUpdate();
                }}
                modal={false}
              />
            </div>
          )}
        <div><b>Comentario de Asignación:</b> {detalle.comentarios_asignacion || "—"}</div>
        {detalle.estado === "Cerrado" && (
          <div>
            <b>Solución aplicada:</b> {detalle.solucion_aplicada || "—"}
          </div>
        )}
        {esTecnicoAsignado &&
          (detalle.estado === "En espera" || detalle.estado === "En proceso") &&
          !detalle.comentarios_asignacion && (
            <div style={{ margin: "12px 0" }}>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Comentario previo a la solución"
                rows={3}
                style={{ width: "100%" }}
              />
              <button className="btn-save" onClick={guardarComentario}>
                Guardar comentario
              </button>
            </div>
          )}
        {esTecnicoAsignado && (detalle.estado === "En espera" || detalle.estado === "En proceso") && (
          <div style={{ margin: "12px 0" }}>
            <textarea
              value={solucion}
              onChange={e => setSolucion(e.target.value)}
              placeholder="Solución aplicada"
              rows={3}
              style={{ width: "100%" }}
            />
            <button className="btn-danger" onClick={cerrarTicket} disabled={!solucion.trim()}>
              Cerrar ticket
            </button>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setShowHistorial(true)}>Ver Historial</button>
        </div>
        {showHistorial && (
          <TicketHistorial
            ticketId={detalle.id}
            onClose={() => setShowHistorial(false)}
          />
        )}
      </div>
    </div>
  );
}