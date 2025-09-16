import { useEffect, useState } from "react";
import axiosBackend from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const numberOrDash = (v) => (v === null || v === undefined ? "-" : Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v));

const Tarifario = () => {
  const { user } = useAuth();
  const rol = user?.user?.rol;

  const [mensaje, setMensaje] = useState("");

  // Cascada original
  const [subidas, setSubidas] = useState([]);
  const [subidaSeleccionada, setSubidaSeleccionada] = useState("");

  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");

  const [modelos, setModelos] = useState([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");
  const [modeloDetalle, setModeloDetalle] = useState({});

  // NUEVO: datos de tabla
  const [kms, setKms] = useState([]);      // ["5000","10000",...]
  const [items, setItems] = useState([]);  // [{tipo, descripcion, codigo, unidad, precios:{km:precio}}]
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Subidas
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosBackend.get("/Tsubida");
        setSubidas(res.data);
      } catch (error) {
        console.error("Error al obtener subidas:", error);
      }
    })();
  }, []);

  // Vehículos por subida
  useEffect(() => {
    if (!subidaSeleccionada) {
      setVehiculos([]); setVehiculoSeleccionado("");
      setModelos([]); setModeloSeleccionado("");
      setModeloDetalle({});
      setKms([]); setItems([]);
      return;
    }
    (async () => {
      try {
        const res = await axiosBackend.get(`/Tvehiculo/subida/${subidaSeleccionada}`);
        setVehiculos(res.data);
      } catch (error) {
        console.error("Error al obtener vehículos:", error);
      }
    })();
  }, [subidaSeleccionada]);

  // Modelos por vehículo
  useEffect(() => {
    if (!vehiculoSeleccionado) {
      setModelos([]); setModeloSeleccionado("");
      setModeloDetalle({});
      setKms([]); setItems([]);
      return;
    }
    (async () => {
      try {
        const res = await axiosBackend.get(`/Tmodelo/vehiculo/${vehiculoSeleccionado}`);
        setModelos(res.data);
      } catch (error) {
        console.error("Error al obtener modelos:", error);
      }
    })();
  }, [vehiculoSeleccionado]);

  // Detalle del modelo + tarifario pivotado
  useEffect(() => {
    if (!modeloSeleccionado) {
      setModeloDetalle({});
      setKms([]); setItems([]);
      return;
    }
    (async () => {
      try {
        // detalle modelo
        const [det] = await Promise.all([
          axiosBackend.get(`/Tmodelo/${modeloSeleccionado}`)
        ]);
        setModeloDetalle(det.data);

        // tarifario pivotado
        setLoadingTabla(true);
        const tarif = await axiosBackend.get(`/Tmantenimientokm/modelo/${modeloSeleccionado}`);
        setKms(tarif.data.kilometrajes || []);
        setItems(tarif.data.items || []);
      } catch (error) {
        console.error("Error al obtener tarifario:", error);
      } finally {
        setLoadingTabla(false);
      }
    })();
  }, [modeloSeleccionado]);

  return (
    <div className="p-4">
      <div className="vehiculos-modelos">
        <h2 className="text-xl font-semibold mb-3">Tarifario</h2>

        <div className="formulario grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Subida */}
          <label className="flex flex-col gap-1">
            <span className="text-sm">Subida</span>
            <select
              className="border rounded px-2 py-1"
              value={subidaSeleccionada}
              onChange={(e) => {
                const value = e.target.value;
                setSubidaSeleccionada(value);
                // reset cascada
                setVehiculos([]); setVehiculoSeleccionado("");
                setModelos([]); setModeloSeleccionado("");
                setModeloDetalle({});
                setKms([]); setItems([]);
              }}
            >
              <option value="">-- Seleccione una subida --</option>
              {subidas.map((s) => (
                <option key={s.id} value={s.id}>{s.numero}</option>
              ))}
            </select>
          </label>

          {/* Vehículos */}
          <label className="flex flex-col gap-1">
            <span className="text-sm">Vehículo</span>
            <select
              className="border rounded px-2 py-1"
              disabled={!subidaSeleccionada}
              value={vehiculoSeleccionado}
              onChange={(e) => {
                const value = e.target.value;
                setVehiculoSeleccionado(value);
                // reset
                setModelos([]); setModeloSeleccionado("");
                setModeloDetalle({});
                setKms([]); setItems([]);
              }}
            >
              <option value="">-- Seleccione un vehículo --</option>
              {vehiculos.map((v) => (
                <option key={v.id_vehiculo} value={v.id_vehiculo}>{v.vehiculo}</option>
              ))}
            </select>
          </label>

          {/* Modelos */}
          <label className="flex flex-col gap-1">
            <span className="text-sm">Modelo</span>
            <select
              className="border rounded px-2 py-1"
              disabled={!vehiculoSeleccionado}
              value={modeloSeleccionado}
              onChange={(e) => {
                const value = e.target.value;
                setModeloSeleccionado(value);
                setModeloDetalle({});
                setKms([]); setItems([]);
              }}
            >
              <option value="">-- Seleccione un modelo --</option>
              {modelos.map((m) => (
                <option key={m.id_modelo} value={m.id_modelo}>{m.modelo}</option>
              ))}
            </select>
          </label>

          {/* Detalle modelo */}
          <div className="flex items-end gap-2">
            <input
              type="text"
              readOnly
              value={modeloDetalle.aplica || ""}
              placeholder="Aplica"
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              readOnly
              value={modeloDetalle.codigo_modelo || ""}
              placeholder="Código Modelo"
              className="border rounded px-2 py-1 w-40"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-auto border rounded">
        {loadingTabla ? (
          <div className="p-4 text-sm text-gray-600">Cargando tarifario…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No hay datos para mostrar.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-left px-3 py-2">Descripción</th>
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Unidad</th>
                {kms.map((km) => (
                  <th key={km} className="text-right px-3 py-2">{km}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id_mant || idx} className="border-t">
                  <td className="px-3 py-2">{it.tipo}</td>
                  <td className="px-3 py-2">{it.descripcion}</td>
                  <td className="px-3 py-2">{it.codigo || "-"}</td>
                  <td className="px-3 py-2">{it.unidad || "-"}</td>
                  {kms.map((km) => (
                    <td key={km} className="text-right px-3 py-2">
                      {numberOrDash(it.precios?.[km] ?? null)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mensaje && <div className="mensaje-exito mt-3">{mensaje}</div>}
    </div>
  );
};

export default Tarifario;
