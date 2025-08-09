import { useEffect, useState } from "react";
import axiosBackend from "../api/axios"; 
import TicketDetalle from "./TicketDetalle";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function TicketsGestion() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [modalObsVisible, setModalObsVisible] = useState(false);
  const [modalObsTexto, setModalObsTexto] = useState("");
  const [modalObsTitulo, setModalObsTitulo] = useState("");

  const cargarTickets = async () => {
    try {
      const res = await axiosBackend.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Error al cargar tickets:", err);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const truncar = (texto, max = 30) =>
    texto && texto.length > max ? texto.slice(0, max) + "..." : texto;

  let ticketsFiltrados = tickets;
  if (
    user?.user?.rol === "tecnico sistemas" &&
    user?.user?.empleado_id
  ) {
    ticketsFiltrados = tickets.filter(
      t => t.personal_asignado_id === user.user.empleado_id
    );
  }

  return (
    <div>
      <h2>Gestión de Tickets</h2>
      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Estado</th>
            <th>Solicitante</th>
            <th>Prioridad</th>
            <th>Asignado a</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ticketsFiltrados.map(t => (
            <tr key={t.id}>
              <td>{t.codigo}</td>
              <td>{t.estado}</td>
              <td>
                {t.solicitante_nombres
                  ? `${t.solicitante_nombres} ${t.solicitante_apellidos}`
                  : "—"}
              </td>
              <td>{t.prioridad}</td>
              <td>
                {t.asignado_nombres
                  ? `${t.asignado_nombres} ${t.asignado_apellidos}`
                  : "Sin asignar"}
              </td>
              <td>
                {t.observacion_inicial
                  ? (
                    <>
                      {truncar(t.observacion_inicial, 30)}
                      {t.observacion_inicial.length > 30 && (
                        <button
                          className="btn-icon btn-info"
                          style={{ marginLeft: 6 }}
                          title="Ver todo"
                          onClick={() => {
                            setModalObsTitulo("Descripción completa");
                            setModalObsTexto(t.observacion_inicial);
                            setModalObsVisible(true);
                          }}
                        >
                          <FaSearch />
                        </button>
                      )}
                    </>
                  )
                  : "Sin descripción"}
              </td>
              <td>
                <button className="btn-info btn-icon" onClick={() => setTicketSeleccionado(t)}>Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalObsVisible && (
        <div className="modal-overlay" onClick={() => setModalObsVisible(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 500, wordBreak: "break-word" }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close-button" onClick={() => setModalObsVisible(false)}>&times;</button>
            <h3>{modalObsTitulo}</h3>
            <div style={{ whiteSpace: "pre-line" }}>{modalObsTexto}</div>
          </div>
        </div>
      )}

      {ticketSeleccionado && (
        <TicketDetalle
          ticket={ticketSeleccionado}
          onClose={() => setTicketSeleccionado(null)}
          onUpdate={cargarTickets}
        />
      )}
    </div>
  );
}