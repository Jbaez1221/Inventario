import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import ActaPDF from "../components/ActaPDF";

const Asignaciones = () => {
  const [mensaje, setMensaje] = useState("");
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [dni, setDni] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [mostrarActa, setMostrarActa] = useState(false);
  const [datosActa, setDatosActa] = useState(null);

  useEffect(() => {
    obtenerEquiposDisponibles();
  }, []);

  const obtenerEquiposDisponibles = async () => {
    try {
      const response = await axiosBackend.get("/equipos/disponibles");
      setEquiposDisponibles(response.data);
    } catch (error) {
      console.error("Error al obtener equipos disponibles", error);
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
      setMensaje("Equipo asignado correctamente ✅");
      setTimeout(() => setMensaje(""), 3000);
      obtenerEquiposDisponibles();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error al asignar equipo");
    }
  };

  return (
    <div className="asignaciones-container">
      <h3>Equipos disponibles para asignar</h3>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}
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
                  <button
                    className="btn-asignar"
                    onClick={() => abrirFormularioAsignacion(equipo)}
                  >
                    Asignar
                  </button>
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
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
            <label>Observaciones:</label>
            <input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-asignar" onClick={asignar}>
                Asignar
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </button>
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
