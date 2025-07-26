import { useEffect, useState, useRef } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import SignatureCanvas from 'react-signature-canvas'; 


const Asignaciones = () => {
  const { token } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [dni, setDni] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const firmaEntregaRef = useRef(null);
  const firmaRecibeRef = useRef(null);

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

  const asignarConFirmas = async () => {
    const dniTrimmed = dni.trim();
    if (!dniTrimmed) return alert("Debe ingresar el DNI del empleado");
    if (firmaEntregaRef.current.isEmpty() || firmaRecibeRef.current.isEmpty()) {
      return alert("Ambas firmas son requeridas para generar el acta.");
    }

    try {
      const response = await axiosBackend.post(
        `/asignaciones/crear-con-firmas`,
        {
          equipo_id: equipoSeleccionado.id,
          dni: dniTrimmed,
          observaciones,
          firmaEntrega: firmaEntregaRef.current.toDataURL('image/png'), // Se envía la firma
          firmaRecibe: firmaRecibeRef.current.toDataURL('image/png'),   // Se envía la firma
        },
        {
          responseType: 'blob',
        }
      );

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `acta-asignacion-firmada-${dniTrimmed}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);

      setMensaje("Equipo asignado y acta firmada generada correctamente ✅");
      setTimeout(() => setMensaje(""), 4000);
      
      setModalVisible(false);
      obtenerEquiposDisponibles();

    } catch (error) {
      console.error("Error en el proceso de asignación con firmas:", error);
      const errorMsg = "No se pudo completar la asignación. Verifique el DNI y las firmas.";
      alert(errorMsg);
    }
  };

  const equiposFiltrados = equiposDisponibles.filter((equipo) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(equipo).some(val =>
      val && String(val).toLowerCase().includes(busquedaLower)
    );
  });

  return (
    <div>
      <h2>Equipos disponibles para asignar</h2>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por tipo, marca, modelo, serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")}>Limpiar</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Serie</th>
              <th>Memoria</th>
              <th>Almacenamiento</th>
              {token && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.length === 0 ? (
              <tr>
                <td colSpan={token ? "8" : "7"}>
                  {busqueda ? "No se encontraron equipos." : "No hay equipos disponibles."}
                </td>
              </tr>
            ) : (
              equiposFiltrados.map((equipo) => (
                <tr key={equipo.id}>
                  <td data-label="ID">{equipo.id}</td>
                  <td data-label="Tipo">{equipo.tipo}</td>
                  <td data-label="Marca">{equipo.marca}</td>
                  <td data-label="Modelo">{equipo.modelo}</td>
                  <td data-label="Serie">{equipo.serie}</td>
                  <td data-label="Memoria">{equipo.memoria || '—'}</td>
                  <td data-label="Almacenamiento">{equipo.almacenamiento || '—'}</td>
                  {token && (
                    <td data-label="Acción">
                      <button onClick={() => abrirFormularioAsignacion(equipo)}>
                        Asignar
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <button className="modal-close-button" onClick={() => setModalVisible(false)}>&times;</button>
            
            <h4>Asignar: {equipoSeleccionado.marca} {equipoSeleccionado.modelo}</h4>
            
            <div className="formulario" style={{ padding: 0, border: 'none', background: 'none' }}>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="DNI del Empleado"
              />
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones de entrega (opcional)"
                rows="3"
                style={{ gridColumn: '1 / -1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div className="firma-container">
                <label className="firma-label">Firma de quien entrega (TI)</label>
                <SignatureCanvas
                  ref={firmaEntregaRef}
                  penColor='black'
                  canvasProps={{ className: 'firma-canvas' }}
                />
                <div className="firma-actions">
                  <button className="btn-secondary" onClick={() => firmaEntregaRef.current.clear()}>Limpiar</button>
                </div>
              </div>
              <div className="firma-container">
                <label className="firma-label">Firma de quien recibe (Empleado)</label>
                <SignatureCanvas
                  ref={firmaRecibeRef}
                  penColor='black'
                  canvasProps={{ className: 'firma-canvas' }}
                />
                <div className="firma-actions">
                  <button className="btn-secondary" onClick={() => firmaRecibeRef.current.clear()}>Limpiar</button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setModalVisible(false)}>Cancelar</button>
              <button onClick={asignarConFirmas} style={{ backgroundColor: '#28a745', color: 'white' }}>
                Confirmar y Generar Acta Firmada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asignaciones;
