import { useEffect, useState, useRef } from "react";
import axiosBackend, { API_URL } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const Equipos = () => {
  const { token } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState({
    tipo: "", marca: "", modelo: "", serie: "", fecha_ingreso: "",
    ubicacion: "", estado: "Disponible", garantia_fin: "", valor_compra: "", observaciones: ""
  });
  
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [equipoEditandoId, setEquipoEditandoId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [historialCurrentPage, setHistorialCurrentPage] = useState(1);
  const historialItemsPerPage = 5;

  const fileInputRef = useRef(null);
  const [modalImagenUrl, setModalImagenUrl] = useState("");
  useEffect(() => {
    obtenerEquipos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

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
      garantia_fin: formatearFechaLocal(equipo.garantia_fin)
    });
    setEquipoEditandoId(equipo.id);
    setModoEdicion(true);
    setImagenPreview(equipo.equipo_url ? `${API_URL}${equipo.equipo_url}` : "");
    setImagenFile(null);
    window.scrollTo(0, 0);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEquipoEditandoId(null);
    setForm({
      tipo: "", marca: "", modelo: "", serie: "", fecha_ingreso: "",
      ubicacion: "", estado: "Disponible", garantia_fin: "", valor_compra: "", observaciones: ""
    });
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

  const formatearFecha = (isoDate) => {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES');
  };

  const equiposFiltrados = equipos.filter((eq) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(eq).some(val =>
      String(val).toLowerCase().includes(busquedaLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = equiposFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(equiposFiltrados.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastHistorialItem = historialCurrentPage * historialItemsPerPage;
  const currentHistorialItems = historial.slice(
    indexOfLastHistorialItem - historialItemsPerPage, 
    indexOfLastHistorialItem
  );
  
  const totalHistorialPages = Math.ceil(historial.length / historialItemsPerPage);
  const paginateHistorial = (pageNumber) => setHistorialCurrentPage(pageNumber);

  return (
    <div className="equipos-container">
      <h2>Equipos</h2>
      {token && (
        <div className="formulario">
          <input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo" />
          <input name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" />
          <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" />
          <input name="serie" value={form.serie} onChange={handleChange} placeholder="Serie" />
          <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} />
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" />
          {modoEdicion && (
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Disponible">Disponible</option>
              <option value="Reparación">Reparación</option>
              <option value="Baja">Baja</option>
            </select>
          )}
          <input name="garantia_fin" type="date" value={form.garantia_fin} onChange={handleChange} />
          <input name="valor_compra" type="number" value={form.valor_compra} onChange={handleChange} placeholder="Valor compra" />
          <input name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Observaciones" />
          
          <div className="form-group-image">
            <label>Imagen del Equipo</label>
            <div className="file-input-wrapper">
              <label htmlFor="imagen-equipo" className="btn-file-upload">
                Seleccionar archivo
              </label>
              <input
                id="imagen-equipo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
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
      
      <div className="busqueda-equipos">
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
              <th>Serie</th>
              <th>Estado</th>
              {token && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((equipo, index) => (
              <tr key={equipo.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  {equipo.equipo_url ? (
                    <img 
                      src={`${API_URL}${equipo.equipo_url}`} 
                      alt={equipo.tipo} 
                      className="equipo-thumbnail"
                      onClick={() => setModalImagenUrl(`${API_URL}${equipo.equipo_url}`)}
                    />
                  ) : (
                    <span className="no-image-placeholder">Sin foto</span>
                  )}
                </td>
                <td>{equipo.tipo}</td>
                <td>{equipo.marca}</td>
                <td>{equipo.modelo}</td>
                <td>{equipo.serie}</td>
                <td>{equipo.estado}</td>
                {token && (
                  <td>
                    <button onClick={() => iniciarEdicion(equipo)}>Editar</button>
                    <button onClick={() => eliminarEquipo(equipo.id)}>Eliminar</button>
                    <button onClick={() => verHistorial(equipo.id)}>Historial</button>
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
            <button className="modal-close-button" onClick={() => setMostrarHistorial(false)}>&times;</button>
            <h3>Historial de Asignación</h3>
            {historial.length === 0 ? (
              <p>Este equipo no tiene historial de asignaciones.</p>
            ) : (
              <>
                <table className="tabla-historial">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Cargo</th>
                      <th>Área</th>
                      <th>Fecha Entrega</th>
                      <th>Fecha Devolución</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHistorialItems.map((h, i) => (
                      <tr key={i}>
                        <td>{h.nombre_empleado || "—"}</td>
                        <td>{h.cargo || "—"}</td>
                        <td>{h.area || "—"}</td>
                        <td>{formatearFecha(h.fecha_entrega)}</td>
                        <td>{formatearFecha(h.fecha_devolucion)}</td>
                        <td>{h.observaciones || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
                <button className="btn-cancelar" onClick={() => setMostrarHistorial(false)}>Cerrar</button>
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
    </div>
  );
};

export default Equipos;
