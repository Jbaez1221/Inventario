import { useEffect, useState } from "react";
import axiosBackend from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { FaSearch } from "react-icons/fa";

const Solicitudes = () => {
  const { token, user } = useAuth();
  const rol = user?.user?.rol;

  const [dni, setDni] = useState("");
  const [tipoEquipo, setTipoEquipo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [motivo, setMotivo] = useState("");

  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [solicitudRechazoId, setSolicitudRechazoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [modalMotivoVisible, setModalMotivoVisible] = useState(false);
  const [modalMotivoTexto, setModalMotivoTexto] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (token && (rol === "admin" || rol === "sistemas")) {
      obtenerSolicitudes();
    }
  }, [token, rol]);

  useEffect(() => {
    setCurrentPage(1);
  }, [solicitudes]);

  const obtenerSolicitudes = async () => {
    try {
      const res = await axiosBackend.get("/solicitudes");
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
    }
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    if (!dni.trim() || !tipoEquipo.trim() || !marca.trim() || !modelo.trim() || !motivo.trim()) {
      alert("Por favor, complete todos los campos del formulario.");
      return;
    }

    try {
      await axiosBackend.post("/solicitudes", {
        dni,
        tipo_equipo: tipoEquipo,
        marca,
        modelo,
        motivo,
        tipo: 'nuevo',
      });
      setMensaje("¡Solicitud enviada con éxito! Nuestro equipo de TI la revisará pronto.");
      setDni("");
      setTipoEquipo("");
      setMarca("");
      setModelo("");
      setMotivo("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al registrar la solicitud. Verifique el DNI e inténtalo de nuevo.";
      alert(errorMsg);
    }
  };

  const cambiarEstado = async (id, estado) => {
    if (estado === "rechazada") {
      setSolicitudRechazoId(id);
      setMotivoRechazo("");
      setModalRechazoVisible(true);
      return;
    }
    try {
      await axiosBackend.put(`/solicitudes/${id}/estado`, { estado });
      obtenerSolicitudes();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo cambiar el estado de la solicitud.");
    }
  };

  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      alert("Debe ingresar un motivo para rechazar la solicitud.");
      return;
    }
    try {
      await axiosBackend.put(`/solicitudes/${solicitudRechazoId}/estado`, {
        estado: "rechazada",
        motivo_rechazo: motivoRechazo,
      });
      setModalRechazoVisible(false);
      setSolicitudRechazoId(null);
      setMotivoRechazo("");
      obtenerSolicitudes();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo cambiar el estado de la solicitud.");
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "—";
    return new Date(fechaISO).toLocaleString("es-PE", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const solicitudesOrdenadas = [...solicitudes].sort((a, b) => {
    if (a.estado === "pendiente" && b.estado !== "pendiente") return -1;
    if (a.estado !== "pendiente" && b.estado === "pendiente") return 1;
    return 0;
  });

  const totalPages = Math.ceil(solicitudesOrdenadas.length / itemsPerPage);
  const paginatedSolicitudes = solicitudesOrdenadas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (token && (rol === "admin" || rol === "sistemas")) {
    return (
      <div>
        <h2>Gestionar Solicitudes de Equipos</h2>
        <div className="tabla-container">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empleado</th>
                <th>Área</th>
                <th>Puesto</th>
                <th>Tipo de Solicitud</th>
                <th>Equipo Solicitado</th>
                <th>Marca / Modelo</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSolicitudes.map((s) => (
                <tr key={s.id}>
                  <td data-label="ID">{s.id}</td>
                  <td data-label="Empleado">{s.empleado_nombre || `(ID: ${s.empleado_id})`}</td>
                  <td data-label="Área">{s.empleado_area || '—'}</td>
                  <td data-label="Puesto">{s.empleado_puesto || '—'}</td>
                  <td data-label="Tipo de Solicitud">
                    <span className={`tipo-solicitud tipo-${s.tipo}`}>{s.tipo || 'N/A'}</span>
                  </td>
                  <td data-label="Equipo Solicitado">{s.tipo_equipo}</td>
                  <td data-label="Marca / Modelo">{s.marca} / {s.modelo}</td>
                  <td data-label="Motivo" className="celda-observaciones" title={s.motivo}>
                    {(s.motivo && s.motivo.length > 40)
                      ? (
                        <>
                          {s.motivo.slice(0, 40)}...
                          <button
                            className="btn-icon btn-info"
                            style={{ marginLeft: 6 }}
                            title="Ver todo"
                            onClick={() => {
                              setModalMotivoTexto(s.motivo);
                              setModalMotivoVisible(true);
                            }}
                          >
                            <FaSearch />
                          </button>
                        </>
                      )
                      : (
                        <>
                          {s.motivo || "—"}
                          {s.motivo && (
                            <button
                              className="btn-icon btn-info"
                              style={{ marginLeft: 6 }}
                              title="Ver todo"
                              onClick={() => {
                                setModalMotivoTexto(s.motivo);
                                setModalMotivoVisible(true);
                              }}
                            >
                              <FaSearch />
                            </button>
                          )}
                        </>
                      )
                    }
                  </td>
                  <td data-label="Estado">
                    <span className={`estado-solicitud estado-${s.estado}`}>{s.estado}</span>
                  </td>
                  <td data-label="Fecha">{formatearFecha(s.fecha_solicitud)}</td>
                  <td data-label="Acciones" className="acciones">
                    {s.estado === "pendiente" ? (
                      <>
                        <button className="btn-success" onClick={() => cambiarEstado(s.id, "aprobada")}>
                          Aprobar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => {
                            setSolicitudRechazoId(s.id);
                            setMotivoRechazo("");
                            setModalRechazoVisible(true);
                          }}
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalRechazoVisible && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 400 }}>
              <button className="modal-close-button" onClick={() => setModalRechazoVisible(false)}>&times;</button>
              <h3>Motivo de Rechazo</h3>
              <textarea
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                placeholder="Ingrese el motivo del rechazo"
                rows={4}
                style={{ width: "100%", marginBottom: 16 }}
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setModalRechazoVisible(false)}>Cancelar</button>
                <button className="btn-danger" onClick={confirmarRechazo}>Rechazar Solicitud</button>
              </div>
            </div>
          </div>
        )}

        {modalMotivoVisible && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 500 }}>
              <button className="modal-close-button" onClick={() => setModalMotivoVisible(false)}>&times;</button>
              <h3>Motivo de la Solicitud</h3>
              <div style={{ whiteSpace: "pre-wrap", margin: "18px 0" }}>
                {modalMotivoTexto}
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setModalMotivoVisible(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span style={{ margin: "0 12px" }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="solicitud-public-container">
      <div className="solicitud-card">
        <h2>Solicitud de Nuevo Equipo</h2>
        <p className="solicitud-subtitle">
          Completa el formulario y nuestro equipo de TI evaluará tu solicitud.
        </p>
        
        {mensaje ? (
          <div className="mensaje-exito-grande">{mensaje}</div>
        ) : (
          <form onSubmit={enviarSolicitud} className="formulario">
            <input
              type="text"
              placeholder="Tu DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tipo de equipo (ej: Laptop, Monitor)"
              value={tipoEquipo}
              onChange={(e) => setTipoEquipo(e.target.value)}
            />
            <input
              type="text"
              placeholder="Marca del equipo"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
            <input
              type="text"
              placeholder="Modelo del equipo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe brevemente por qué necesitas el equipo"
              rows="4"
              style={{ gridColumn: '1 / -1' }}
            ></textarea>
            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>
              Enviar Solicitud
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;