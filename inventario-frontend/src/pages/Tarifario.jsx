import { useEffect, useState, useRef } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import SignatureCanvas from 'react-signature-canvas';

const Tarifario = () => {
  const { token, user } = useAuth();
  const rol = user?.user?.rol;

  const [mensaje, setMensaje] = useState("");
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [modelos, setModelos] = useState([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");
  const [modeloDetalle, setModeloDetalle] = useState({});

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const res = await axiosBackend.get("/vehiculos");
        setVehiculos(res.data);
      } catch (error) {
        console.error("Error al obtener vehículos:", error);
      }
    };
    fetchVehiculos();
  }, []);

  useEffect(() => {
    if (!vehiculoSeleccionado) {
      setModelos([]);
      setModeloSeleccionado("");
      setModeloDetalle({});
      return;
    }
    const fetchModelos = async () => {
      try {
        const res = await axiosBackend.get(`/vehiculos/${vehiculoSeleccionado}/modelos`);
        setModelos(res.data);
      } catch (error) {
        console.error("Error al obtener modelos:", error);
      }
    };
    fetchModelos();
  }, [vehiculoSeleccionado]);

  useEffect(() => {
    if (!modeloSeleccionado) {
      setModeloDetalle({});
      return;
    }
    const fetchModeloDetalle = async () => {
      try {
        const res = await axiosBackend.get(`/modelos/${modeloSeleccionado}`);
        setModeloDetalle(res.data);
      } catch (error) {
        console.error("Error al obtener detalle del modelo:", error);
      }
    };
    fetchModeloDetalle();
  }, [modeloSeleccionado]);

  /*  if (!token || (rol !== "admin" && rol !== "sistemas")) {
     return <div>No tienes permisos para ver esta sección.</div>;
   } */

  return (
    <div>
      <div className="vehiculos-modelos">
        <h2>Tarifario</h2>

        <div className="formulario">
          <div className="form-group">
            <label>Vehículo</label>
            <select
              value={vehiculoSeleccionado}
              onChange={(e) => setVehiculoSeleccionado(e.target.value)}
            >
              <option value="">-- Seleccione un vehículo --</option>
              {vehiculos.map((vehiculo) => (
                <option key={vehiculo.idvehiculo} value={vehiculo.idvehiculo}>
                  {vehiculo.vehiculo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Modelo</label>
            <select
              disabled={!vehiculoSeleccionado}
              value={modeloSeleccionado}
              onChange={(e) => setModeloSeleccionado(e.target.value)}
            >
              <option value="">-- Seleccione un modelo --</option>
              {modelos.map((m) => (
                <option key={m.idmodelo} value={m.idmodelo}>
                  {m.modelo}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              readOnly
              value={modeloDetalle.aplica || ""}
              placeholder="Aplica"
              size={modeloDetalle.aplica ? Math.max(modeloDetalle.aplica.length, 5) : 3}
              className="border rounded px-2 py-1"
            />
            <input
                type="text"
                readOnly
                value={modeloDetalle.codigomodelo || ""}
                placeholder="Código Modelo"
                className="border rounded px-2 py-1 w-40"
              />
          </div>
          {/* <span>:</span> */}


        </div>
      </div>

      {/* {token && (rol === "admin" || rol === "sistemas") && (
        <div className="migrar">
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
      )} */}


      {mensaje && <div className="mensaje-exito">{mensaje}</div>}
      {/* <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por tipo, marca, modelo, serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")}>Limpiar</button>
      </div> */}

      {/* <div className="tabla-container">
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
              <div className="form-group-full-width">
                <label>Imagen de entrega (opcional)</label>
                <div className="file-input-wrapper">
                  <button type="button" onClick={() => fileInputRef.current.click()}>
                    Seleccionar archivo
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  {imagenFile && <span className="file-name">{imagenFile.name}</span>}
                </div>
                {imagenPreview && (
                  <div className="image-preview">
                    <img src={imagenPreview} alt="Vista previa de entrega" />
                  </div>
                )}
              </div>
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
      )} */}
    </div>
  );
};

export default Tarifario;
