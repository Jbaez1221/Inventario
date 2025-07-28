import { useEffect, useState, useRef } from "react";
import axiosBackend, { API_URL } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import SignatureCanvas from 'react-signature-canvas';
import { FaSearch } from "react-icons/fa";

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

  const firmaRecibeRef = useRef(null);
  const firmaDevuelveRef = useRef(null);
  const [modalImagenUrl, setModalImagenUrl] = useState("");
  const [imagenSalidaFile, setImagenSalidaFile] = useState(null);
  const [imagenSalidaPreview, setImagenSalidaPreview] = useState("");
  const fileInputSalidaRef = useRef(null);

  const [modalObsVisible, setModalObsVisible] = useState(false);
  const [modalObsTexto, setModalObsTexto] = useState("");
  const [modalObsTitulo, setModalObsTitulo] = useState("");

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

  const handleImageSalidaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenSalidaFile(file);
      setImagenSalidaPreview(URL.createObjectURL(file));
    }
  };

  const ejecutarDevolucionConFirmas = async () => {
    if (firmaRecibeRef.current.isEmpty() || firmaDevuelveRef.current.isEmpty()) {
      return alert("Ambas firmas son requeridas para generar el acta de devolución.");
    }

    try {
      const formData = new FormData();
      formData.append("observacion_devolucion", devolucionObservaciones);
      formData.append("firmaRecibe", firmaRecibeRef.current.toDataURL('image/png'));
      formData.append("firmaDevuelve", firmaDevuelveRef.current.toDataURL('image/png'));
      if (imagenSalidaFile) {
        formData.append("imagen_salida", imagenSalidaFile);
      }

      const response = await axiosBackend.post(
        `/devoluciones/con-firmas/${idADevolver}`,
        formData,
        { responseType: 'blob' }
      );

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;

      const contentDisposition = response.headers['content-disposition'];
      let fileName = `acta-devolucion-firmada-${idADevolver}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);

      setMensaje("Equipo devuelto y acta firmada generada correctamente ✅");
      setTimeout(() => setMensaje(""), 4000);
      obtenerAsignaciones();

    } catch (error) {
      console.error("Error en el proceso de devolución con firmas:", error);
      alert("No se pudo completar la devolución. Verifique los datos.");
    } finally {
      setModalDevolverVisible(false);
      setIdADevolver(null);
      setImagenSalidaFile(null);
      setImagenSalidaPreview("");
    }
  };

  const asignacionesFiltradas = asignaciones.filter((a) => {
    const busquedaLower = busquedaEmpleado.toLowerCase().trim();
    const matchEmpleado = !busquedaLower ||
      (a.empleado && a.empleado.toLowerCase().includes(busquedaLower)) ||
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
        <div className="filtro-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por empleado o DNI..."
            value={busquedaEmpleado}
            onChange={(e) => setBusquedaEmpleado(e.target.value)}
          />
        </div>
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
              <th>Equipo (Serie)</th>
              <th>Fecha entrega</th>
              <th>Fecha devolución</th>
              <th>Obs. Entrega</th>
              <th>Obs. Devolución</th>
              <th>Imagen Entrega</th>
              <th>Imagen Devolución</th>
              {token && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="10">No hay asignaciones que coincidan con los filtros.</td>
              </tr>
            ) : (
              currentItems.map((a) => (
                <tr key={a.id}>
                  <td data-label="Empleado">{a.empleado} ({a.empleado_dni})</td>
                  <td data-label="Área">{a.empleado_area || "—"}</td>
                  <td data-label="Equipo (Serie)">{`${a.equipo_tipo} ${a.equipo_marca} (${a.equipo_serie})`}</td>
                  <td data-label="Fecha entrega">{formatearFecha(a.fecha_entrega)}</td>
                  <td data-label="Fecha devolución">{formatearFecha(a.fecha_devolucion)}</td>
                  <td data-label="Obs. Entrega" className="celda-observaciones" title={a.observaciones}>
                    {(a.observaciones && a.observaciones.length > 40)
                      ? (
                        <>
                          {a.observaciones.slice(0, 40)}...
                          <button
                            className="btn-icon btn-info"
                            style={{ marginLeft: 6 }}
                            title="Ver todo"
                            onClick={() => {
                              setModalObsTitulo("Observaciones de Entrega");
                              setModalObsTexto(a.observaciones);
                              setModalObsVisible(true);
                            }}
                          >
                            <FaSearch />
                          </button>
                        </>
                      )
                      : (a.observaciones || "—")}
                  </td>
                  <td data-label="Obs. Devolución" className="celda-observaciones" title={a.observacion_devolucion}>
                    {(a.observacion_devolucion && a.observacion_devolucion.length > 40)
                      ? (
                        <>
                          {a.observacion_devolucion.slice(0, 40)}...
                          <button
                            className="btn-icon btn-info"
                            style={{ marginLeft: 6 }}
                            title="Ver todo"
                            onClick={() => {
                              setModalObsTitulo("Observaciones de Devolución");
                              setModalObsTexto(a.observacion_devolucion);
                              setModalObsVisible(true);
                            }}
                          >
                            <FaSearch />
                          </button>
                        </>
                      )
                      : (a.observacion_devolucion || "—")}
                  </td>
                  <td data-label="Imagen Entrega">
                    {a.imagen_entrada_url ? (
                      <img
                        src={`${API_URL}${a.imagen_entrada_url.startsWith('/') ? '' : '/'}${a.imagen_entrada_url}`}
                        alt="Imagen entrega"
                        className="equipo-thumbnail"
                        onClick={() => setModalImagenUrl(`${API_URL}${a.imagen_entrada_url.startsWith('/') ? '' : '/'}${a.imagen_entrada_url}`)}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <span className="no-image-placeholder">Sin foto</span>
                    )}
                  </td>
                  <td data-label="Imagen Devolución">
                    {a.imagen_salida_url ? (
                      <img
                        src={`${API_URL}/${a.imagen_salida_url}`}
                        alt="Imagen devolución"
                        className="equipo-thumbnail"
                        onClick={() => setModalImagenUrl(`${API_URL}/${a.imagen_salida_url}`)}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <span className="no-image-placeholder">Sin foto</span>
                    )}
                  </td>
                  {token && (
                    <td data-label="Acción" className="acciones">
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
          <div className="modal-content" style={{ maxWidth: '700px' }}>
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
              <div className="form-group-full-width">
                <label>Imagen de devolución (opcional)</label>
                <div className="file-input-wrapper">
                  <button type="button" onClick={() => fileInputSalidaRef.current.click()}>
                    Seleccionar archivo
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSalidaChange}
                    ref={fileInputSalidaRef}
                    style={{ display: 'none' }}
                  />
                  {imagenSalidaFile && <span className="file-name">{imagenSalidaFile.name}</span>}
                </div>
                {imagenSalidaPreview && (
                  <div className="image-preview">
                    <img src={imagenSalidaPreview} alt="Vista previa devolución" />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div className="firma-container">
                <label className="firma-label">Firma de quien recibe (TI)</label>
                <SignatureCanvas
                  ref={firmaRecibeRef}
                  penColor='black'
                  canvasProps={{ className: 'firma-canvas' }}
                />
                <div className="firma-actions">
                  <button className="btn-secondary" onClick={() => firmaRecibeRef.current.clear()}>Limpiar</button>
                </div>
              </div>
              <div className="firma-container">
                <label className="firma-label">Firma de quien devuelve (Empleado)</label>
                <SignatureCanvas
                  ref={firmaDevuelveRef}
                  penColor='black'
                  canvasProps={{ className: 'firma-canvas' }}
                />
                <div className="firma-actions">
                  <button className="btn-secondary" onClick={() => firmaDevuelveRef.current.clear()}>Limpiar</button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalDevolverVisible(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={ejecutarDevolucionConFirmas}>
                Confirmar y Generar Acta Firmada
              </button>
            </div>
          </div>
        </div>
      )}

      {modalImagenUrl && (
        <div className="modal-overlay" onClick={() => setModalImagenUrl("")}>
          <div className="modal-content-image" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setModalImagenUrl("")}>&times;</button>
            <img src={modalImagenUrl} alt="Vista ampliada" />
          </div>
        </div>
      )}

      {modalObsVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <button className="modal-close-button" onClick={() => setModalObsVisible(false)}>&times;</button>
            <h3>{modalObsTitulo}</h3>
            <div className="modal-obs-texto">
              {modalObsTexto}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalObsVisible(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialEquipo;
