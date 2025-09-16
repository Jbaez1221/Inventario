import { useEffect, useState } from "react";
import axiosBackend from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const Tarifario = () => {
  const { token, user } = useAuth();
  const rol = user?.user?.rol;

  const [mensaje, setMensaje] = useState("");

  // Estados
  const [subidas, setSubidas] = useState([]);
  const [subidaSeleccionada, setSubidaSeleccionada] = useState("");

  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");

  const [modelos, setModelos] = useState([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");
  const [modeloDetalle, setModeloDetalle] = useState({});

  // 🔹 Cargar subidas al iniciar
  useEffect(() => {
    const fetchSubidas = async () => {
      try {
        const res = await axiosBackend.get("/Tsubida");
        setSubidas(res.data);
      } catch (error) {
        console.error("Error al obtener subidas:", error);
      }
    };
    fetchSubidas();
  }, []);


  // 🔹 Cuando cambio de subida, cargar vehículos de esa subida
  useEffect(() => {
    if (!subidaSeleccionada) {
      setVehiculos([]);
      setVehiculoSeleccionado("");
      setModelos([]);
      setModeloSeleccionado("");
      setModeloDetalle({});
      return;
    }
    const fetchVehiculos = async () => {
      try {
        const res = await axiosBackend.get(`/Tvehiculo/subida/${subidaSeleccionada}`);
        setVehiculos(res.data);
      } catch (error) {
        console.error("Error al obtener vehículos:", error);
      }
    };
    fetchVehiculos();
  }, [subidaSeleccionada]);

  // 🔹 Cuando cambio de vehículo, cargar modelos
  useEffect(() => {
    if (!vehiculoSeleccionado) {
      setModelos([]);
      setModeloSeleccionado("");
      setModeloDetalle({});
      return;
    }
    const fetchModelos = async () => {
      try {
        const res = await axiosBackend.get(`/Tmodelo/vehiculo/${vehiculoSeleccionado}`);
        setModelos(res.data);
      } catch (error) {
        console.error("Error al obtener modelos:", error);
      }
    };
    fetchModelos();
  }, [vehiculoSeleccionado]);

  // 🔹 Cuando cambio de modelo, traer detalle
  useEffect(() => {
    if (!modeloSeleccionado) {
      setModeloDetalle({});
      return;
    }
    const fetchModeloDetalle = async () => {
      try {
        const res = await axiosBackend.get(`/Tmodelo/${modeloSeleccionado}`);
        setModeloDetalle(res.data);
      } catch (error) {
        console.error("Error al obtener detalle del modelo:", error);
      }
    };
    fetchModeloDetalle();
  }, [modeloSeleccionado]);

  return (
    <div>
      <div className="vehiculos-modelos">
        <h2>Tarifario</h2>

        <div className="formulario">
          {/* Subida */}
          <div className="form-group">
            <label>
              Subida{" "}
              <select
                value={subidaSeleccionada}
                onChange={(e) => {
                  const value = e.target.value;
                  setSubidaSeleccionada(value);
                  // reset cascada
                  setVehiculos([]);
                  setVehiculoSeleccionado("");
                  setModelos([]);
                  setModeloSeleccionado("");
                  setModeloDetalle({});
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
          </div>

          {/* Vehículos */}
          <div className="form-group">
            <label>
              Vehículo{" "}
              <select
                disabled={!subidaSeleccionada}
                value={vehiculoSeleccionado}
                onChange={(e) => {
                  const value = e.target.value;
                  setVehiculoSeleccionado(value);
                  // reset cascada
                  setModelos([]);
                  setModeloSeleccionado("");
                  setModeloDetalle({});
                }}
              >
                <option value="">-- Seleccione un vehículo --</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id_vehiculo} value={vehiculo.id_vehiculo}>
                    {vehiculo.vehiculo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Modelos */}
          <div className="form-group">
            <label>
              Modelo{" "}
              <select
                disabled={!vehiculoSeleccionado}
                value={modeloSeleccionado}
                onChange={(e) => {
                  const value = e.target.value;
                  setModeloSeleccionado(value);
                  // reset cascada
                  setModeloDetalle({});
                }}
              >
                <option value="">-- Seleccione un modelo --</option>
                {modelos.map((m) => (
                  <option key={m.id_modelo} value={m.id_modelo}>
                    {m.modelo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Detalle del modelo */}
          <div className="form-group">
            <input
              type="text"
              readOnly
              value={modeloDetalle.aplica || ""}
              placeholder="Aplica"
              className="border rounded px-2 py-1"
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

      {mensaje && <div className="mensaje-exito">{mensaje}</div>}
    </div>
  );
};

export default Tarifario;
