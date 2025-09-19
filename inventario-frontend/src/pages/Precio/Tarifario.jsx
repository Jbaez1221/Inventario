import { useEffect, useState } from "react";
import axiosBackend from "../../api/axios";
import "../../App.css";

const numberOrDash = (v) =>
  v === null || v === undefined
    ? "-"
    : Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

const formatCurrency = (value) =>
  value ? `S/ ${numberOrDash(value)}` : "-";

const Tarifario = () => {
  const [error, setError] = useState(null);

  const [subidas, setSubidas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [modeloDetalle, setModeloDetalle] = useState({});
  const [kms, setKms] = useState([]);
  const [items, setItems] = useState([]);

  const [subidaSeleccionada, setSubidaSeleccionada] = useState("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");

  const [loadingTabla, setLoadingTabla] = useState(false);

  // Subidas
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosBackend.get("/Tsubida");
        setSubidas(res.data);
      } catch {
        setError("Error al cargar subidas");
      }
    })();
  }, []);

  // Vehículos
  useEffect(() => {
    if (!subidaSeleccionada) {
      setVehiculos([]);
      setVehiculoSeleccionado("");
      setModelos([]);
      setModeloSeleccionado("");
      setModeloDetalle({});
      setKms([]);
      setItems([]);
      return;
    }
    (async () => {
      try {
        const res = await axiosBackend.get(`/Tvehiculo/subida/${subidaSeleccionada}`);
        setVehiculos(res.data);
      } catch {
        setError("Error al cargar vehículos");
      }
    })();
  }, [subidaSeleccionada]);

  // Modelos
  useEffect(() => {
    if (!vehiculoSeleccionado) {
      setModelos([]);
      setModeloSeleccionado("");
      setModeloDetalle({});
      setKms([]);
      setItems([]);
      return;
    }
    (async () => {
      try {
        const res = await axiosBackend.get(`/Tmodelo/vehiculo/${vehiculoSeleccionado}`);
        setModelos(res.data);
      } catch {
        setError("Error al cargar modelos");
      }
    })();
  }, [vehiculoSeleccionado]);

  // Detalle modelo + tarifario
  useEffect(() => {
    if (!modeloSeleccionado) {
      setModeloDetalle({});
      setKms([]);
      setItems([]);
      return;
    }
    (async () => {
      try {
        setLoadingTabla(true);
        const [det, tarif] = await Promise.all([
          axiosBackend.get(`/Tmodelo/${modeloSeleccionado}`),
          axiosBackend.get(`/Tmantenimientokm/modelo/${modeloSeleccionado}`),
        ]);
        setModeloDetalle(det.data);
        setKms(tarif.data.kilometrajes || []);
        console.log("este es anteni con mode:", tarif);
        setItems(
          (tarif.data.items || []).sort((a, b) => {
            const order = { "MANO DE OBRA": 1, REPUESTOS: 2, FLUIDOS: 3 };
            return order[a.tipo] - order[b.tipo];
          })
        );
      } catch {
        setError("Error al cargar tarifario");
      } finally {
        setLoadingTabla(false);
      }
    })();
  }, [modeloSeleccionado]);

  let tablaContent;
  if (loadingTabla) {
    tablaContent = <div className="loading">Cargando tarifario…</div>;
  } else if (items.length === 0) {
    tablaContent = <div className="empty">No hay datos para mostrar.</div>;
  } else {
    tablaContent = (
      <table className="tabla-tarifario">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Código</th>
            <th>Unidad</th>
            {kms.map((km) => (
              <th key={km}>{km} km</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id_mant}>
              <td>{it.tipo}</td>
              <td>{it.descripcion}</td>
              <td>{it.codigo || "-"}</td>
              <td>{it.unidad || "-"}</td>
              {kms.map((km) => (
                <td key={km}>{formatCurrency(it.precios?.[km])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="tarifario-container">
      <h1>Tarifario de Mantenimiento</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filtros-card">
        <h2>Filtros</h2>
        <div className="filtros-grid">
          <label>
            Version
            {' '}
            <select
              value={subidaSeleccionada}
              onChange={(e) => {
                setSubidaSeleccionada(e.target.value);
                setVehiculoSeleccionado("");
                setModeloSeleccionado("");
              }}
            >
              <option value="">-- Seleccione una subida --</option>
              {subidas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.numero}
                </option>
              ))}
            </select>
          </label>

          <label>
            Vehículo
            {' '}
            <select
              value={vehiculoSeleccionado}
              disabled={!subidaSeleccionada}
              onChange={(e) => {
                setVehiculoSeleccionado(e.target.value);
                setModeloSeleccionado("");
              }}
            >
              <option value="">-- Seleccione un vehículo --</option>
              {vehiculos.map((v) => (
                <option key={v.id_vehiculo} value={v.id_vehiculo}>
                  {v.vehiculo}
                </option>
              ))}
            </select>
          </label>

          <label>
            Modelo
            {' '}
            <select
              value={modeloSeleccionado}
              disabled={!vehiculoSeleccionado}
              onChange={(e) => setModeloSeleccionado(e.target.value)}
            >
              <option value="">-- Seleccione un modelo --</option>
              {modelos.map((m) => (
                <option key={m.id_modelo} value={m.id_modelo}>
                  {m.modelo}
                </option>
              ))}
            </select>
          </label>

          <div className="inputs-detalle">
            <input
              type="text"
              readOnly
              value={modeloDetalle.aplica || ""}
              placeholder="Aplica"
              size={modeloDetalle.aplica?.length || 6}
            />
            <input
              type="text"
              readOnly
              value={modeloDetalle.codigo_modelo || ""}
              placeholder="Código Modelo"
              size={modeloDetalle.codigo_modelo || 12}
            />
          </div>
        </div>
      </div>

      <h2>Precios de Mantenimiento</h2>
      <div className="tabla-wrapper">{tablaContent}</div>
    </div>
  );
};

export default Tarifario;
