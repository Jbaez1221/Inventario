import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const Equipos = () => {
  const { token } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState({
    tipo: "",
    marca: "",
    modelo: "",
    serie: "",
    fecha_ingreso: "",
    ubicacion: "",
    estado: "Disponible",
    garantia_fin: "",
    valor_compra: "",
    observaciones: ""
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [equipoEditandoId, setEquipoEditandoId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerEquipos();
  }, []);

  const obtenerEquipos = async () => {
    try {
      const res = await axiosBackend.get("/equipos");
      setEquipos(res.data);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
      alert("Error al cargar equipos");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarEquipo = async () => {
    for (const key in form) {
      if (key === 'observaciones') {
        continue;
      }
      if (form[key] === "") {
        alert(`El campo '${key}' es obligatorio.`);
        return;
      }
    }

    try {
      if (modoEdicion) {
        await axiosBackend.put(`/equipos/${equipoEditandoId}`, form);
        setModoEdicion(false);
        setEquipoEditandoId(null);
      } else {
        await axiosBackend.post("/equipos", form);
      }

      setForm({
        tipo: "",
        marca: "",
        modelo: "",
        serie: "",
        fecha_ingreso: "",
        ubicacion: "",
        estado: "Disponible",
        garantia_fin: "",
        valor_compra: "",
        observaciones: ""
      });
      obtenerEquipos();
    } catch (err) {
      console.error("Error al guardar equipo:", err);
      alert("Error al guardar equipo");
    }
  };

  const eliminarEquipo = async (id) => {
    if (!window.confirm("¿Eliminar equipo?")) return;
    try {
      await axiosBackend.delete(`/equipos/${id}`);
      obtenerEquipos();
    } catch (err) {
      console.error("Error al eliminar equipo:", err);
      alert("Error al eliminar equipo");
    }
  };

  const iniciarEdicion = (equipo) => {
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      return fecha.split("T")[0]; // yyyy-mm-dd
    };

    setForm({
      ...equipo,
      fecha_ingreso: formatearFecha(equipo.fecha_ingreso),
      garantia_fin: formatearFecha(equipo.garantia_fin)
    });

    setEquipoEditandoId(equipo.id);
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEquipoEditandoId(null);
    setForm({
      tipo: "",
      marca: "",
      modelo: "",
      serie: "",
      fecha_ingreso: "",
      ubicacion: "",
      estado: "Disponible",
      garantia_fin: "",
      valor_compra: "",
      observaciones: ""
    });
  };

  const verHistorial = async (equipoId) => {
    try {
      const res = await axiosBackend.get(`/asignaciones/historial/${equipoId}`);
      setHistorial(res.data);
      setMostrarHistorial(true);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      alert("Error al cargar historial");
    }
  };

  const formatearFecha = (isoDate) => {
    if (!isoDate) return "No devuelto";
    const [a, m, d] = isoDate.split("T")[0].split("-");
    return `${d}/${m}/${a}`;
  };

  const equiposFiltrados = equipos.filter((eq) =>
    [eq.tipo, eq.marca, eq.modelo, eq.serie, eq.observaciones]
      .some((campo) =>
        campo?.toLowerCase().includes(busqueda.toLowerCase())
      )
  );

  return (
    <div className="equipos-container">
      <h2>Equipos</h2>

      {token && (
        <div className="formulario-equipo">
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
          <input name="valor_compra" value={form.valor_compra} onChange={handleChange} placeholder="Valor compra" />
          <input name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Observaciones" />
          <div className="botones">
            <button onClick={guardarEquipo}>{modoEdicion ? "Actualizar" : "Agregar"}</button>
            {modoEdicion && <button onClick={cancelarEdicion}>Cancelar</button>}
          </div>
        </div>
      )}

      <div className="busqueda-equipos">
        <input
          type="text"
          placeholder="Buscar equipo por tipo, marca, serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")}>Limpiar</button>
      </div>

      <table className="tabla-equipos">
        <thead>
          <tr>
            <th>N°</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Serie</th>
            <th>Ubicación</th>
            <th>Observaciones</th>
            <th>Estado</th>
            {token && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {equiposFiltrados.map((equipo, index) => (
            <tr key={equipo.id}>
              <td>{index + 1}</td>
              <td>{equipo.tipo}</td>
              <td>{equipo.marca}</td>
              <td>{equipo.modelo}</td>
              <td>{equipo.serie}</td>
              <td>{equipo.ubicacion}</td>
              <td>{equipo.observaciones}</td>
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

      {mostrarHistorial && (
        <div className="modal">
          <div className="modal-content">
            <h3>Historial de asignación</h3>
            {historial.length === 0 ? (
              <p>No hay registros</p>
            ) : (
              <table className="tabla-historial">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha Entrega</th>
                    <th>Fecha Devolución</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h, i) => (
                    <tr key={i}>
                      <td>{h.nombre_empleado || "—"}</td>
                      <td>{formatearFecha(h.fecha_entrega)}</td>
                      <td>{formatearFecha(h.fecha_devolucion)}</td>
                      <td>{h.observaciones || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={() => setMostrarHistorial(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipos;
