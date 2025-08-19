import { useEffect, useState } from "react";
import axiosBackend from "../api/axios"; 
import TicketDetalle from "./TicketDetalle";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function TicketsGestion() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [modalObsVisible, setModalObsVisible] = useState(false);
  const [modalObsTexto, setModalObsTexto] = useState("");
  const [modalObsTitulo, setModalObsTitulo] = useState("");
  
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

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

  const totalTickets = ticketsFiltrados.length;
  const totalPaginas = Math.ceil(totalTickets / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const ticketsPaginados = ticketsFiltrados.slice(indiceInicio, indiceFin);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [tickets]);

  return (
    <div>
      <h2>Gestión de Tickets</h2>
      
      <div className="pagination-info">
        <span>
          Mostrando {indiceInicio + 1} - {Math.min(indiceFin, totalTickets)} de {totalTickets} tickets
        </span>
      </div>

      <table className="tabla-datos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Estado</th>
            <th>Solicitante</th>
            <th>Prioridad</th>
            <th>Asignado a</th>
            <th>AnyDesk</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ticketsPaginados.map(t => (
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
                {t.anydesk_info ? (
                  <span className="anydesk-available" title={`AnyDesk: ${t.anydesk_info}`}>
                    🖥️ {t.anydesk_info}
                  </span>
                ) : (
                  <span className="anydesk-not-available">—</span>
                )}
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

      {totalPaginas > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            <FaChevronLeft />
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
              <button
                key={numero}
                className={`pagination-number ${numero === paginaActual ? 'active' : ''}`}
                onClick={() => cambiarPagina(numero)}
              >
                {numero}
              </button>
            ))}
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            <FaChevronRight />
          </button>
        </div>
      )}

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