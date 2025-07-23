import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import "../HistorialEquipo.css";

const HistorialEquipo = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [modalDevolverVisible, setModalDevolverVisible] = useState(false);
  const [idADevolver, setIdADevolver] = useState(null);
  const [devolucionObservaciones, setDevolucionObservaciones] = useState(""); // Estado para las observaciones de devolución

  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const obtenerAsignaciones = async () => {
    try {
      const response = await axiosBackend.get("/asignaciones");
      setAsignaciones(response.data);
    } catch (error) {
      console.error("Error al obtener asignaciones", error);
    }
  };

  useEffect(() => {
    obtenerAsignaciones();
  }, []);

  const formatearFecha = (isoDate) => {
    if (!isoDate) return "";
    const [a, m, d] = isoDate.split("T")[0].split("-");
    return `${d}/${m}/${a}`;
  };

  const confirmarDevolucion = (id) => {
    setIdADevolver(id);
    setDevolucionObservaciones("");
    setModalDevolverVisible(true);
  };

  const ejecutarDevolucion = async () => {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const hoy = `${anio}-${mes}-${dia}`;

    try {
      const response = await axiosBackend.post(
        `/devoluciones/${idADevolver}`,
        {
          fecha_devolucion: hoy,
          observaciones: devolucionObservaciones,
        },
        {
          responseType: 'blob',
        }
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
    const busquedaLower = busquedaEmpleado.toLowerCase();
    const matchEmpleado =
      a.empleado.toLowerCase().includes(busquedaLower) ||
      (a.empleado_dni && a.empleado_dni.toLowerCase().includes(busquedaLower));

    const matchFechaInicio = !fechaInicio || a.fecha_entrega.split('T')[0] === fechaInicio;
    
    const matchFechaFin = !fechaFin || (a.fecha_devolucion && a.fecha_devolucion.split('T')[0] === fechaFin);

    return matchEmpleado && matchFechaInicio && matchFechaFin;
  });

  return (
    <div className="historial-container">
      <h2 className="historial-titulo">Historial General de Asignaciones</h2>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}

      <div className="filtros-historial">
        <input
          type="text"
          placeholder="Buscar por empleado o DNI..."
          value={busquedaEmpleado}
          onChange={(e) => setBusquedaEmpleado(e.target.value)}
        />
        <input
          type="date"
          title="Filtrar por fecha de entrega"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          title="Filtrar por fecha de devolución"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <button onClick={() => {
          setBusquedaEmpleado("");
          setFechaInicio("");
          setFechaFin("");
        }}>Limpiar</button>
      </div>

      <table className="tabla-asignaciones">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Serie</th>
            <th>Tipo</th>
            <th>Fecha entrega</th>
            <th>Fecha devolución</th>
            <th>Observaciones</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {asignacionesFiltradas.length === 0 ? (
            <tr>
              <td colSpan="7">No hay asignaciones que coincidan con los filtros.</td>
            </tr>
          ) : (
            asignacionesFiltradas.map((a) => (
              <tr key={a.id}>
                <td>{a.empleado}</td>
                <td>{a.equipo_serie}</td>
                <td>{a.equipo_tipo}</td>
                <td>{formatearFecha(a.fecha_entrega)}</td>
                <td>
                  {a.fecha_devolucion
                    ? formatearFecha(a.fecha_devolucion)
                    : "—"}
                </td>
                <td>{a.observaciones || "—"}</td>
                <td>
                  {!a.fecha_devolucion && (
                    <button
                      onClick={() => confirmarDevolucion(a.id)}
                      className="btn-devolver"
                    >
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalDevolverVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <p>¿Deseas devolver este equipo?</p>
            <label>Observaciones de devolución:</label>
            <textarea
              value={devolucionObservaciones}
              onChange={(e) => setDevolucionObservaciones(e.target.value)}
              placeholder="Ej: El equipo se devuelve en buen estado."
            />
            <div className="modal-actions">
              <button className="btn-asignar" onClick={ejecutarDevolucion}>
                Sí, devolver y generar acta
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModalDevolverVisible(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistorialEquipo;
