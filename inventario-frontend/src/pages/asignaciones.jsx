import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const Asignaciones = () => {
  const { token } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [dni, setDni] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [busqueda, setBusqueda] = useState("");

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
    const dniTrimmed = dni.trim();
    if (!dniTrimmed) return alert("Debe ingresar el DNI del empleado");

    try {
      const empleadoResponse = await axiosBackend.get(`/empleados/por-dni/${dniTrimmed}`);
      const empleado = empleadoResponse.data;
      if (!empleado) {
        alert("Error: No se encontró ningún empleado con el DNI proporcionado.");
        return;
      }

      if (empleado.estado === 'Inactivo') {
        alert("Error: El empleado no está activo y no se le puede asignar un equipo.");
        return;
      }

      const response = await axiosBackend.post(
        `/asignaciones/por-dni`,
        {
          equipo_id: equipoSeleccionado.id,
          dni: dniTrimmed,
          observaciones,
        },
        {
          responseType: 'blob',
        }
      );

      const nombreArchivo = `Acta-Entrega-${equipoSeleccionado.marca}-${equipoSeleccionado.serie}.pdf`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMensaje("Equipo asignado y acta generada correctamente ✅");
      setTimeout(() => setMensaje(""), 4000);
      
      setModalVisible(false);
      obtenerEquiposDisponibles();

    } catch (error) {
      console.error("Error en el proceso de asignación:", error);
      const errorMsg = error.response?.data?.error || "No se pudo completar la asignación. Verifique los datos.";
      alert(errorMsg);
    }
  };

  const equiposFiltrados = equiposDisponibles.filter((equipo) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;

    return (
      equipo.tipo.toLowerCase().includes(busquedaLower) ||
      equipo.marca.toLowerCase().includes(busquedaLower) ||
      equipo.modelo.toLowerCase().includes(busquedaLower) ||
      equipo.serie.toLowerCase().includes(busquedaLower) ||
      equipo.ubicacion.toLowerCase().includes(busquedaLower)
    );
  });

  return (
    <div className="asignaciones-container">
      <h3>Equipos disponibles para asignar</h3>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}

      <div className="busqueda-equipos" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por tipo, marca, modelo, serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")}>Limpiar</button>
      </div>

      <table className="tabla-asignaciones">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Serie</th>
            <th>Ubicación</th>
            {token && <th>Acción</th>}
          </tr>
        </thead>
        <tbody>
          {equiposFiltrados.length === 0 ? (
            <tr>
              <td colSpan="7">
                {busqueda ? "No se encontraron equipos que coincidan con la búsqueda." : "No hay equipos disponibles."}
              </td>
            </tr>
          ) : (
            equiposFiltrados.map((equipo) => (
              <tr key={equipo.id}>
                <td>{equipo.id}</td>
                <td>{equipo.tipo}</td>
                <td>{equipo.marca}</td>
                <td>{equipo.modelo}</td>
                <td>{equipo.serie}</td>
                <td>{equipo.ubicacion}</td>
                {token && (
                  <td>
                    <button
                      className="btn-asignar"
                      onClick={() => abrirFormularioAsignacion(equipo)}
                    >
                      Asignar
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={() => setModalVisible(false)}>&times;</button>
            
            <h4>Asignar: {equipoSeleccionado.marca} {equipoSeleccionado.modelo} (S/N: {equipoSeleccionado.serie})</h4>
            
            <label>DNI del Empleado:</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingrese el DNI"
            />
            <label>Observaciones (opcional):</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Se entrega con cargador y maletín."
              rows="3"
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
