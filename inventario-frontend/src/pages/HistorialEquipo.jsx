import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const HistorialEquipo = () => {
  const { token } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [modalDevolverVisible, setModalDevolverVisible] = useState(false);
  const [idADevolver, setIdADevolver] = useState(null);
  const [devolucionObservaciones, setDevolucionObservaciones] = useState("");

  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    obtenerAsignaciones();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [busquedaEmpleado, fechaInicio, fechaFin]);

  const obtenerAsignaciones = async () => {
    try {
      const response = await axiosBackend.get("/asignaciones");
      const asignacionesOrdenadas = response.data.sort((a, b) => {
        const aSinDevolver = !a.fecha_devolucion;
        const bSinDevolver = !b.fecha_devolucion;
        if (aSinDevolver && !bSinDevolver) return -1;
        if (!aSinDevolver && bSinDevolver) return 1;
        return new Date(b.fecha_entrega) - new Date(a.fecha_entrega);
      });
      setAsignaciones(asignacionesOrdenadas);
    } catch (error) {
      console.error("Error al obtener asignaciones", error);
    }
  };

  const formatearFecha = (isoDate) => {
    if (!isoDate) return "—";
    return new Date(isoDate).toLocaleDateString('es-ES');
  };

  const confirmarDevolucion = (id) => {
    setIdADevolver(id);
    setDevolucionObservaciones("");
    setModalDevolverVisible(true);
  };

  const ejecutarDevolucion = async () => {
    try {
      const response = await axiosBackend.post(
        `/devoluciones/${idADevolver}`,
        { observaciones: devolucionObservaciones },
        { responseType: 'blob' }
      );
      const nombreArchivo = `Acta-Devolucion-${idADevolver}.pdf`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMensaje("Equipo devuelto y acta generada correctamente ✅");
      setTimeout(() => setMensaje(""), 4000);
      obtenerAsignaciones();
    } catch (error) {
      console.error("Error en el proceso de devolución:", error);
      alert("No se pudo completar la devolución.");
    } finally {
      setModalDevolverVisible(false);
      setIdADevolver(null);
    }
  };

  const asignacionesFiltradas = asignaciones.filter((a) => {
    const busquedaLower = busquedaEmpleado.toLowerCase().trim();
    const matchEmpleado = !busquedaLower ||
      a.empleado.toLowerCase().includes(busquedaLower) ||
      (a.empleado_dni && a.empleado_dni.includes(busquedaLower));

    const fechaEntrega = a.fecha_entrega ? a.fecha_entrega.split('T')[0] : null;
    const matchFechaInicio = !fechaInicio || (fechaEntrega && fechaEntrega >= fechaInicio);
    const matchFechaFin = !fechaFin || (fechaEntrega && fechaEntrega <= fechaFin);

    return matchEmpleado && matchFechaInicio && matchFechaFin;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = asignacionesFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(asignacionesFiltradas.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2>Historial General de Asignaciones</h2>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por empleado o DNI..."
          value={busquedaEmpleado}
          onChange={(e) => setBusquedaEmpleado(e.target.value)}
        />
        <input
          type="date"
          title="Fecha de entrega (desde)"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          title="Fecha de entrega (hasta)"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <button className="btn-secondary" onClick={() => {
          setBusquedaEmpleado("");
          setFechaInicio("");
          setFechaFin("");
        }}>Limpiar</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Área</th>
              <th>Serie</th>
              <th>Tipo</th>
              <th>Fecha entrega</th>
              <th>Fecha devolución</th>
              <th>Observaciones</th>
              {token && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="8">No hay asignaciones que coincidan con los filtros.</td>
              </tr>
            ) : (
              currentItems.map((a) => (
                <tr key={a.id}>
                  <td>{a.empleado}</td>
                  <td>{a.empleado_area || "—"}</td>
                  <td>{a.equipo_serie}</td>
                  <td>{a.equipo_tipo}</td>
                  <td>{formatearFecha(a.fecha_entrega)}</td>
                  <td>{formatearFecha(a.fecha_devolucion)}</td>
                  <td>{a.observaciones || "—"}</td>
                  {token && (
                    <td className="acciones">
                      {!a.fecha_devolucion && (
                        <button
                          onClick={() => confirmarDevolucion(a.id)}
                          className="btn-primary"
                        >
                          Devolver
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
            Siguiente
          </button>
        </div>
      )}

      {modalDevolverVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={() => setModalDevolverVisible(false)}>&times;</button>
            <h4>Confirmar Devolución de Equipo</h4>
            <div className="formulario" style={{ padding: 0, border: 'none', background: 'none' }}>
              <textarea
                value={devolucionObservaciones}
                onChange={(e) => setDevolucionObservaciones(e.target.value)}
                placeholder="Observaciones de devolución (opcional)"
                rows="3"
                style={{ gridColumn: '1 / -1' }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalDevolverVisible(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={ejecutarDevolucion}>
                Devolver y Generar Acta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialEquipo;
