import { useEffect, useState, useRef } from "react";
import axiosBackend, { API_URL } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaPencilAlt, FaTrash, FaHistory, FaEye, FaSearch } from "react-icons/fa";

const Equipos = () => {
  const { token } = useAuth();
  const [equipos, setEquipos] = useState([]);
  
  const formInicial = {
    tipo: "", marca: "", modelo: "", serie: "", fecha_ingreso: "",
    ubicacion: "", estado: "Disponible", valor_compra: "", 
    observaciones: "", memoria: "", almacenamiento: "", garantia: ""
  };
  const [form, setForm] = useState(formInicial);
  
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [equipoEditandoId, setEquipoEditandoId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [historialCurrentPage, setHistorialCurrentPage] = useState(1);
  const historialItemsPerPage = 5;
  const [historialBusqueda, setHistorialBusqueda] = useState("");

  const fileInputRef = useRef(null);
  const [modalImagenUrl, setModalImagenUrl] = useState("");

  const [modalSolicitudVisible, setModalSolicitudVisible] = useState(false);
  const [equipoParaSolicitar, setEquipoParaSolicitar] = useState(null);
  const [solicitudDni, setSolicitudDni] = useState("");
  const [solicitudMotivo, setSolicitudMotivo] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  const [modalEquipoVisible, setModalEquipoVisible] = useState(false);
  const [equipoVisualizar, setEquipoVisualizar] = useState(null);

  const [modalObsVisible, setModalObsVisible] = useState(false);
  const [modalObsTexto, setModalObsTexto] = useState("");
  const [modalObsTitulo, setModalObsTitulo] = useState("");

  useEffect(() => {
    obtenerEquipos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  useEffect(() => {
    setHistorialCurrentPage(1);
  }, [historialBusqueda]);

  const obtenerEquipos = async () => {
    try {
      const res = await axiosBackend.get("/equipos");
      setEquipos(res.data);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const guardarEquipo = async () => {
    const camposRequeridos = {
      tipo: "Tipo",
      marca: "Marca",
      modelo: "Modelo",
      serie: "Serie",
      fecha_ingreso: "Fecha de Ingreso",
      ubicacion: "Ubicación",
      garantia: "Años de Garantía",
      valor_compra: "Valor de Compra"
    };

    for (const campo in camposRequeridos) {
      if (!form[campo] || String(form[campo]).trim() === "") {
        alert(`El campo "${camposRequeridos[campo]}" es obligatorio.`);
        return;
      }
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }

    try {
      if (modoEdicion) {
        await axiosBackend.put(`/equipos/${equipoEditandoId}`, formData);
      } else {
        await axiosBackend.post("/equipos", formData);
      }
      cancelarEdicion();
      obtenerEquipos();
    } catch (err) {
      console.error("Error al guardar equipo:", err);
      alert("Error al guardar equipo");
    }
  };

  const iniciarEdicion = (equipo) => {
    const formatearFechaLocal = (fecha) => fecha ? fecha.split("T")[0] : "";
    setForm({
      ...equipo,
      fecha_ingreso: formatearFechaLocal(equipo.fecha_ingreso),
      garantia: equipo.garantia || ""
    });
    setEquipoEditandoId(equipo.id);
    setModoEdicion(true);
    setImagenPreview(
      equipo.equipo_url
        ? `${API_URL}${equipo.equipo_url.startsWith("/") ? "" : "/"}${equipo.equipo_url}`
        : ""
    );
    setImagenFile(null);
    window.scrollTo(0, 0);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEquipoEditandoId(null);
    setForm(formInicial);
    setImagenFile(null);
    setImagenPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const eliminarEquipo = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este equipo?")) return;
    try {
      await axiosBackend.delete(`/equipos/${id}`);
      obtenerEquipos();
    } catch (err) {
      console.error("Error al eliminar equipo:", err);
      alert("Error al eliminar equipo. Verifique que no tenga asignaciones activas.");
    }
  };

  const verHistorial = async (equipoId) => {
    try {
      const res = await axiosBackend.get(`/asignaciones/historial/${equipoId}`);
      setHistorial(res.data);
      setHistorialCurrentPage(1);
      setMostrarHistorial(true);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      alert("Error al cargar historial");
    }
  };

  const abrirModalSolicitud = (equipo) => {
    setEquipoParaSolicitar(equipo);
    setModalSolicitudVisible(true);
  };

  const cerrarModalSolicitud = () => {
    setModalSolicitudVisible(false);
    setEquipoParaSolicitar(null);
    setSolicitudDni("");
    setSolicitudMotivo("");
    setMensajeModal("");
  };

  const enviarSolicitudStock = async () => {
    if (!solicitudDni.trim() || !solicitudMotivo.trim()) {
      alert("Debe ingresar su DNI y el motivo de la solicitud.");
      return;
    }

    try {
      await axiosBackend.post('/solicitudes', {
        dni: solicitudDni,
        tipo_equipo: equipoParaSolicitar.tipo,
        marca: equipoParaSolicitar.marca,
        modelo: equipoParaSolicitar.modelo,
        motivo: solicitudMotivo,
        tipo: 'stock',
      });
      setMensajeModal("¡Solicitud enviada con éxito! El equipo de TI la revisará pronto.");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "No se pudo enviar la solicitud.";
      console.error("Error al enviar solicitud de stock:", error);
      setMensajeModal(errorMsg);
    }
  };

  const formatearFecha = (isoDate) => {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES');
  };

  const calcularFinGarantia = (fechaIngreso, aniosGarantia) => {
    if (!fechaIngreso || !aniosGarantia) return "—";
    const fecha = new Date(fechaIngreso);
    fecha.setFullYear(fecha.getFullYear() + parseInt(aniosGarantia));
    return fecha.toLocaleDateString('es-ES');
  };

  const equiposFiltrados = equipos.filter((eq) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(eq).some(val =>
      val && String(val).toLowerCase().includes(busquedaLower)
    );
  });

  const historialFiltrado = historial.filter((h) => {
    const busquedaLower = historialBusqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(h).some(val =>
      val && String(val).toLowerCase().includes(busquedaLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = equiposFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(equiposFiltrados.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastHistorialItem = historialCurrentPage * historialItemsPerPage;
  const indexOfFirstHistorialItem = indexOfLastHistorialItem - historialItemsPerPage;
  const currentHistorialItems = historialFiltrado.slice(
    indexOfFirstHistorialItem,
    indexOfLastHistorialItem
  );
  const totalHistorialPages = Math.ceil(historialFiltrado.length / historialItemsPerPage);
  const paginateHistorial = (pageNumber) => setHistorialCurrentPage(pageNumber);

  return (
    <div>
      <h2>Equipos</h2>
      {token && (
        <div className="formulario">
          <input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo" />
          <input name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" />
          <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" />
          <input name="serie" value={form.serie} onChange={handleChange} placeholder="Serie" />
          <input name="memoria" value={form.memoria} onChange={handleChange} placeholder="Memoria (e.g., 16GB RAM)" />
          <input name="almacenamiento" value={form.almacenamiento} onChange={handleChange} placeholder="Almacenamiento (e.g., 512GB SSD)" />
          <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} />
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" />
          {modoEdicion && (
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Disponible">Disponible</option>
              <option value="Reparación">Reparación</option>
              <option value="Baja">Baja</option>
            </select>
          )}
          <input
            name="garantia"
            type="number"
            min="0"
            value={form.garantia || ""}
            onChange={handleChange}
            placeholder="Años de garantía"
          />
          <div className="form-group-full-width">
            <input name="valor_compra" type="number" value={form.valor_compra} onChange={handleChange} placeholder="Valor de compra" />
          </div>
          <div className="form-group-full-width">
            <textarea 
              name="observaciones" 
              value={form.observaciones} 
              onChange={handleChange} 
              placeholder="Observaciones"
              rows="3"
            />
          </div>
          
          <div className="form-group-full-width" style={{ gridColumn: '1 / -1' }}>
            <label>Imagen del Equipo</label>
            <div className="file-input-wrapper">
              <button type="button" onClick={() => fileInputRef.current.click()}>
                Seleccionar archivo
              </button>
              <input
                id="imagen-equipo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              {imagenFile && <span className="file-name">{imagenFile.name}</span>}
              {!imagenFile && imagenPreview && <span className="file-name">Imagen actual</span>}
            </div>
            {imagenPreview && (
              <div className="image-preview">
                <img src={imagenPreview} alt="Vista previa del equipo" />
              </div>
            )}
          </div>

          <div className="botones">
            <button onClick={guardarEquipo}>{modoEdicion ? "Actualizar" : "Agregar"}</button>
            {modoEdicion && <button onClick={cancelarEdicion}>Cancelar</button>}
          </div>
        </div>
      )}
      
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar en todos los campos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")}>Limpiar</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>N°</th>
              <th>Imagen</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Estado</th>
              {token && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((equipo, index) => (
              <tr key={equipo.id}>
                <td data-label="N°">{indexOfFirstItem + index + 1}</td>
                <td data-label="Imagen">
                  {equipo.equipo_url ? (
                    <img 
                      src={`${API_URL}/${equipo.equipo_url}`} 
                      alt={equipo.tipo} 
                      className="equipo-thumbnail"
                      onClick={() => setModalImagenUrl(`${API_URL}/${equipo.equipo_url}`)}
                    />
                  ) : (
                    <span className="no-image-placeholder">Sin foto</span>
                  )}
                </td>
                <td data-label="Tipo">{equipo.tipo}</td>
                <td data-label="Marca">{equipo.marca}</td>
                <td data-label="Modelo">{equipo.modelo}</td>
                <td data-label="Estado">
                  {!token && equipo.estado === 'Disponible' ? (
                    <button className="btn-success" onClick={() => abrirModalSolicitud(equipo)}>
                      Disponible
                    </button>
                  ) : (
                    equipo.estado
                  )}
                </td>
                {token && (
                  <td data-label="Acciones" className="acciones">
                    <button onClick={() => setEquipoVisualizar(equipo) || setModalEquipoVisible(true)} className="btn-info btn-icon" title="Visualizar">
                      <FaEye />
                    </button>
                    <button onClick={() => iniciarEdicion(equipo)} className="btn-primary btn-icon" title="Editar"><FaPencilAlt /></button>
                    <button onClick={() => eliminarEquipo(equipo.id)} className="btn-danger btn-icon" title="Eliminar"><FaTrash /></button>
                    <button onClick={() => verHistorial(equipo.id)} className="btn-info btn-icon" title="Historial"><FaHistory /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
            Siguiente
          </button>
        </div>
      )}

      {mostrarHistorial && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <button className="modal-close-button" onClick={() => { setMostrarHistorial(false); setHistorialBusqueda(""); }}>&times;</button>
            <h3>Historial de Asignación</h3>

            <div className="filtros-container modal-filtros">
              <input
                type="text"
                placeholder="Buscar en el historial..."
                value={historialBusqueda}
                onChange={(e) => setHistorialBusqueda(e.target.value)}
              />
              <button onClick={() => setHistorialBusqueda("")} className="btn-secondary">Limpiar</button>
            </div>

            {historialFiltrado.length === 0 ? (
              <p>
                {historialBusqueda
                  ? "No se encontraron registros con ese criterio."
                  : "Este equipo no tiene historial de asignaciones."
                }
              </p>
            ) : (
              <>
                <div className="tabla-modal-container">
                  <table className="tabla-datos">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Puesto</th>
                        <th>Área</th>
                        <th>Fecha Entrega</th>
                        <th>Fecha Devolución</th>
                        <th>Obs. Entrega</th>
                        <th>Obs. Devolución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentHistorialItems.map((h, i) => (
                        <tr key={i}>
                          <td>{h.empleado || "—"}</td>
                          <td>{h.puesto || "—"}</td>
                          <td>{h.area || "—"}</td>
                          <td>{formatearFecha(h.fecha_entrega)}</td>
                          <td>{formatearFecha(h.fecha_devolucion)}</td>
                          <td className="celda-observaciones" title={h.observaciones}>
                            {(h.observaciones && h.observaciones.length > 40)
                              ? (
                                <>
                                  {h.observaciones.slice(0, 40)}...
                                  <button
                                    className="btn-icon btn-info"
                                    style={{ marginLeft: 6 }}
                                    title="Ver todo"
                                    onClick={() => {
                                      setModalObsTitulo("Observaciones de Entrega");
                                      setModalObsTexto(h.observaciones);
                                      setModalObsVisible(true);
                                    }}
                                  >
                                    <FaSearch />
                                  </button>
                                </>
                              )
                              : (h.observaciones || "—")}
                          </td>
                          <td className="celda-observaciones" title={h.observacion_devolucion}>
                            {(h.observacion_devolucion && h.observacion_devolucion.length > 40)
                              ? (
                                <>
                                  {h.observacion_devolucion.slice(0, 40)}...
                                  <button
                                    className="btn-icon btn-info"
                                    style={{ marginLeft: 6 }}
                                    title="Ver todo"
                                    onClick={() => {
                                      setModalObsTitulo("Observaciones de Devolución");
                                      setModalObsTexto(h.observacion_devolucion);
                                      setModalObsVisible(true);
                                    }}
                                  >
                                    <FaSearch />
                                  </button>
                                </>
                              )
                              : (h.observacion_devolucion || "—")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalHistorialPages > 1 && (
                  <div className="pagination modal-pagination">
                    <button onClick={() => paginateHistorial(historialCurrentPage - 1)} disabled={historialCurrentPage === 1}>
                      Anterior
                    </button>
                    <span>
                      Página {historialCurrentPage} de {totalHistorialPages}
                    </span>
                    <button onClick={() => paginateHistorial(historialCurrentPage + 1)} disabled={historialCurrentPage === totalHistorialPages}>
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
            <div className="modal-actions">
                <button onClick={() => { setMostrarHistorial(false); setHistorialBusqueda(""); }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modalSolicitudVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={cerrarModalSolicitud}>&times;</button>
            <h4>Solicitar Equipo: {equipoParaSolicitar?.marca} {equipoParaSolicitar?.modelo}</h4>
            <p>Serie: {equipoParaSolicitar?.serie}</p>
            
            {mensajeModal ? (
              <div className={mensajeModal.startsWith("¡Solicitud enviada") ? "mensaje-exito" : "mensaje-error"}>
                {mensajeModal}
              </div>
            ) : (
              <div className="formulario" style={{ padding: 0, border: 'none', background: 'none' }}>
                <input
                  type="text"
                  placeholder="Ingresa tu DNI"
                  value={solicitudDni}
                  onChange={(e) => setSolicitudDni(e.target.value)}
                  style={{ gridColumn: '1 / -1' }}
                />
                <textarea
                  value={solicitudMotivo}
                  onChange={(e) => setSolicitudMotivo(e.target.value)}
                  placeholder="¿Por qué necesitas este equipo?"
                  rows="4"
                  style={{ gridColumn: '1 / -1' }}
                ></textarea>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={cerrarModalSolicitud}>
                Cerrar
              </button>
              {!mensajeModal.startsWith("¡Solicitud enviada") && (
                <button className="btn-primary" onClick={enviarSolicitudStock}>
                  Confirmar Solicitud
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {modalImagenUrl && (
        <div className="modal-overlay" onClick={() => setModalImagenUrl("")}>
          <div className="modal-content-image" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setModalImagenUrl("")}>&times;</button>
            <img src={modalImagenUrl} alt="Vista ampliada del equipo" />
          </div>
        </div>
      )}

      {modalEquipoVisible && equipoVisualizar && (
        <div className="modal-overlay">
          <div className="modal-content equipo-modal-card">
            <button className="modal-close-button" onClick={() => setModalEquipoVisible(false)}>&times;</button>
            <h3 style={{ textAlign: "left", marginBottom: 18, color: "#fff", fontWeight: 700 }}>Detalle del Equipo</h3>
            <div>
              {equipoVisualizar.equipo_url ? (
                <img
                  src={`${API_URL}/${equipoVisualizar.equipo_url}`}
                  alt={equipoVisualizar.tipo}
                />
              ) : (
                <span className="no-image-placeholder">Sin foto</span>
              )}
            </div>
            <table className="equipo-modal-table">
              <tbody>
                <tr>
                  <td>Tipo:</td>
                  <td>{equipoVisualizar.tipo}</td>
                </tr>
                <tr>
                  <td>Marca:</td>
                  <td>{equipoVisualizar.marca}</td>
                </tr>
                <tr>
                  <td>Modelo:</td>
                  <td>{equipoVisualizar.modelo}</td>
                </tr>
                <tr>
                  <td>Serie:</td>
                  <td>{equipoVisualizar.serie}</td>
                </tr>
                <tr>
                  <td>Memoria:</td>
                  <td>{equipoVisualizar.memoria}</td>
                </tr>
                <tr>
                  <td>Almacenamiento:</td>
                  <td>{equipoVisualizar.almacenamiento}</td>
                </tr>
                <tr>
                  <td>Ubicación:</td>
                  <td>{equipoVisualizar.ubicacion}</td>
                </tr>
                <tr>
                  <td>Estado:</td>
                  <td>{equipoVisualizar.estado}</td>
                </tr>
                <tr>
                  <td>Valor de compra:</td>
                  <td>{equipoVisualizar.valor_compra}</td>
                </tr>
                <tr>
                  <td>Fecha de ingreso:</td>
                  <td>{formatearFecha(equipoVisualizar.fecha_ingreso)}</td>
                </tr>
                <tr>
                  <td>Años de garantía:</td>
                  <td>{equipoVisualizar.garantia || "—"}</td>
                </tr>
                <tr>
                  <td>Fin de garantía (aprox):</td>
                  <td>{calcularFinGarantia(equipoVisualizar.fecha_ingreso, equipoVisualizar.garantia)}</td>
                </tr>
                <tr>
                  <td>Observaciones:</td>
                  <td>{equipoVisualizar.observaciones || "—"}</td>
                </tr>
              </tbody>
            </table>
            <div className="modal-actions">
              <button onClick={() => setModalEquipoVisible(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modalObsVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <button className="modal-close-button" onClick={() => setModalObsVisible(false)}>&times;</button>
            <h3>{modalObsTitulo}</h3>
            <div
              className="modal-obs-texto"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                maxHeight: "40vh",
                overflowY: "auto",
                margin: "18px 0",
                fontSize: "1rem",
                lineHeight: 1.5,
              }}
            >
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

export default Equipos;
