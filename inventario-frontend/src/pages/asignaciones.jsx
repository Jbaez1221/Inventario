import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import ActaPDF from "../components/ActaPDF";

const Asignaciones = () => {
  const [mensaje, setMensaje] = useState("");
  const [asignaciones, setAsignaciones] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [dni, setDni] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [modalDevolverVisible, setModalDevolverVisible] = useState(false);
  const [idADevolver, setIdADevolver] = useState(null);
  const [mostrarActa, setMostrarActa] = useState(false);
  const [datosActa, setDatosActa] = useState(null);

  useEffect(() => {
    obtenerAsignaciones();
    obtenerEquiposDisponibles();
  }, []);

  const obtenerAsignaciones = async () => {
    try {
      const response = await axiosBackend.get("/asignaciones");
      setAsignaciones(response.data);
    } catch (error) {
      console.error("Error al obtener asignaciones", error);
    }
  };

  const obtenerEquiposDisponibles = async () => {
    try {
      const response = await axiosBackend.get("/equipos/disponibles");
      setEquiposDisponibles(response.data);
    } catch (error) {
      console.error("Error al obtener equipos disponibles", error);
    }
  };

  const formatearFecha = (isoDate) => {
    if (!isoDate) return "";
    const [a, m, d] = isoDate.split("T")[0].split("-");
    return `${d}/${m}/${a}`;
  };

  const confirmarDevolucion = (id) => {
    setIdADevolver(id);
    setModalDevolverVisible(true);
  };

  const ejecutarDevolucion = async () => {
    const hoy = new Date().toISOString().split("T")[0];

    try {
      await axiosBackend.put(`/asignaciones/${idADevolver}/devolver`, {
        fecha_devolucion: hoy,
      });

      setMensaje("Equipo devuelto correctamente ✅");
      setTimeout(() => setMensaje(""), 3000);
      obtenerAsignaciones();
      obtenerEquiposDisponibles();
    } catch (error) {
      console.error("Error al devolver equipo", error);
      alert("No se pudo devolver el equipo.");
    } finally {
      setModalDevolverVisible(false);
      setIdADevolver(null);
    }
  };

  const abrirFormularioAsignacion = (equipo) => {
    setEquipoSeleccionado(equipo);
    setDni("");
    setObservaciones("");
    setModalVisible(true);
  };

  const asignar = async () => {
  if (!dni) return alert("Debe ingresar el DNI del empleado");

  try {
    // Obtener datos del empleado
    const resEmpleado = await axiosBackend.get(`/empleados/por-dni/${dni}`);
    const empleado = resEmpleado.data;
    console.log("Empleado recibido:", empleado);

   


    // Crear la asignación
    await axiosBackend.post("/asignaciones/por-dni", {
      equipo_id: equipoSeleccionado.id,
      dni,
      observaciones,
    });

    // Obtener total de asignaciones actuales
    const resAsignaciones = await axiosBackend.get("/asignaciones");
    const numeroActa = resAsignaciones.data.length + 1;
    const fechaEntrega = new Date().toISOString().split("T")[0];
    


    // Construir los datos del acta
    setDatosActa({
      numeroActa: numeroActa,
      id: equipoSeleccionado.id,
      empleado: empleado.nombre_completo || "Sin Nombre",
      dni: empleado.dni || "Sin DNI",
      tipo: equipoSeleccionado.tipo,
      marca: equipoSeleccionado.marca,
      modelo: equipoSeleccionado.modelo,
      serie: equipoSeleccionado.serie,
      observaciones: observaciones || "—",
      fecha_entrega: fechaEntrega || "Sin fecha",
    });



    setMostrarActa(true);
    setModalVisible(false);
    obtenerAsignaciones();
    obtenerEquiposDisponibles();
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.error || "Error al asignar equipo");
  }
};


  return (
    <div className="asignaciones-container">
      <h3>Equipos disponibles para asignar</h3>
      <table className="tabla-asignaciones">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Serie</th>
            <th>Ubicación</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {equiposDisponibles.length === 0 ? (
            <tr>
              <td colSpan="7">No hay equipos disponibles.</td>
            </tr>
          ) : (
            equiposDisponibles.map((equipo) => (
              <tr key={equipo.id}>
                <td>{equipo.id}</td>
                <td>{equipo.tipo}</td>
                <td>{equipo.marca}</td>
                <td>{equipo.modelo}</td>
                <td>{equipo.serie}</td>
                <td>{equipo.ubicacion}</td>
                <td>
                  <button className="btn-asignar" onClick={() => abrirFormularioAsignacion(equipo)}>
                    Asignar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>Asignaciones</h2>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}

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
          {asignaciones.length === 0 ? (
            <tr>
              <td colSpan="7">No hay asignaciones registradas.</td>
            </tr>
          ) : (
            asignaciones.map((a) => (
              <tr key={a.id}>
                <td>{a.empleado}</td>
                <td>{a.equipo_serie}</td>
                <td>{a.equipo_tipo}</td>
                <td>{formatearFecha(a.fecha_entrega)}</td>
                <td>{a.fecha_devolucion ? formatearFecha(a.fecha_devolucion) : "—"}</td>
                <td>{a.observaciones || "—"}</td>
                <td>
                  {!a.fecha_devolucion && (
                    <button onClick={() => confirmarDevolucion(a.id)} className="btn-devolver">
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de asignación */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <label>DNI:</label>
            <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} />
            <label>Observaciones:</label>
            <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            <div className="modal-actions">
              <button className="btn-asignar" onClick={asignar}>Asignar</button>
              <button className="btn-cancelar" onClick={() => setModalVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de devolución */}
      {modalDevolverVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <p>¿Deseas devolver este equipo?</p>
            <div className="modal-actions">
              <button className="btn-asignar" onClick={ejecutarDevolucion}>Sí, devolver</button>
              <button className="btn-cancelar" onClick={() => setModalDevolverVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Acta PDF */}
      {mostrarActa && datosActa && (
        <ActaPDF datos={datosActa} onClose={() => setMostrarActa(false)} />
      )}
    </div>
  );
};

export default Asignaciones;
