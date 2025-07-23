import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";

const Asignaciones = () => {
  const [mensaje, setMensaje] = useState("");
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [dni, setDni] = useState("");
  const [observaciones, setObservaciones] = useState("");

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
      // Llamada al endpoint que crea la asignación y devuelve el PDF
      const response = await axiosBackend.post(
        `/asignaciones/por-dni`,
        {
          equipo_id: equipoSeleccionado.id,
          dni,
          observaciones,
        },
        {
          responseType: 'blob', // ¡Importante para recibir el archivo!
        }
      );

      // Lógica para descargar el PDF recibido del backend
      const nombreArchivo = `Acta-Entrega-${equipoSeleccionado.id}.pdf`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMensaje("Equipo asignado y acta generada correctamente ✅");
      setTimeout(() => setMensaje(""), 4000);
      
      // Cerrar modal y refrescar lista
      setModalVisible(false);
      obtenerEquiposDisponibles();

    } catch (error) {
      console.error("Error en el proceso de asignación:", error);
      alert("No se pudo completar la asignación. Verifique el DNI.");
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
                Asignar y Generar Acta
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
    </div>
  );
};

export default Asignaciones;
