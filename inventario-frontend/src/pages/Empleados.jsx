import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const Empleados = () => {
  const { token } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({
    nombre_completo: "",
    dni: "",
    correo: "",
    area: "",
    cargo: "",
    estado: "Activo",
    celular: ""
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [empleadoEditandoId, setEmpleadoEditandoId] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const obtenerEmpleados = async () => {
    try {
      const res = await axiosBackend.get("/empleados");
      setEmpleados(res.data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      alert("Error al cargar empleados");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarEmpleado = async () => {
    for (const key in form) {
      if (key !== 'celular' && form[key] === "") {
        alert(`El campo ${key.replace('_', ' ')} es obligatorio.`);
        return;
      }
    }

    try {
      if (modoEdicion) {
        await axiosBackend.put(`/empleados/${empleadoEditandoId}`, form);
        setModoEdicion(false);
        setEmpleadoEditandoId(null);
      } else {
        await axiosBackend.post("/empleados", form);
      }

      setForm({
        nombre_completo: "",
        dni: "",
        correo: "",
        area: "",
        cargo: "",
        estado: "Activo",
        celular: ""
      });
      obtenerEmpleados();
    } catch (err) {
      console.error("Error al guardar empleado:", err);
      alert("Error al guardar empleado");
    }
  };

  const confirmarEliminacion = (empleado) => {
    setEmpleadoAEliminar(empleado);
    setMostrarConfirmacion(true);
  };

  const eliminarEmpleado = async () => {
    try {
      await axiosBackend.delete(`/empleados/${empleadoAEliminar.id}`);
      setMostrarConfirmacion(false);
      obtenerEmpleados();
    } catch (err) {
      console.error("Error al eliminar empleado:", err);
      alert("Error al eliminar");
    }
  };

  const handleEditar = (empleado) => {
    setForm({ ...empleado });
    setEmpleadoEditandoId(empleado.id);
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEmpleadoEditandoId(null);
    setForm({
      nombre_completo: "",
      dni: "",
      correo: "",
      area: "",
      cargo: "",
      estado: "Activo",
      celular: ""
    });
  };

  const empleadosFiltrados = empleados.filter((empleado) =>
    empleado.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    empleado.dni.toLowerCase().includes(busqueda.toLowerCase()) ||
    empleado.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (empleado.celular && empleado.celular.toLowerCase().includes(busqueda.toLowerCase())) || // 4. AÑADIR CELULAR A LA BÚSQUEDA
    empleado.area.toLowerCase().includes(busqueda.toLowerCase()) ||
    empleado.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
    empleado.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="empleados-container">
      <h2>Empleados</h2>

      {token && (
        <div className="formulario-empleado">
          <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} placeholder="Nombre completo" />
          <input name="dni" value={form.dni} onChange={handleChange} placeholder="DNI" />
          <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo" />
          <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular" /> {/* 2. AÑADIR INPUT PARA CELULAR */}
          <input name="area" value={form.area} onChange={handleChange} placeholder="Área" />
          <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Cargo" />
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <div className="botones">
            <button onClick={guardarEmpleado}>{modoEdicion ? "Actualizar" : "Agregar"}</button>
            {modoEdicion && <button onClick={cancelarEdicion}>Cancelar</button>}
          </div>
        </div>
      )}

      <div className="busqueda-empleados">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, correo, celular, área..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn-buscar" onClick={() => setBusqueda("")}>Limpiar</button>
      </div>

      <table className="tabla-empleados">
        <thead>
          <tr>
            <th>N°</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Correo</th>
            <th>Celular</th>
            <th>Área</th>
            <th>Cargo</th>
            <th>Estado</th>
            {token && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map((empleado, index) => (
            <tr key={empleado.id}>
              <td>{index + 1}</td>
              <td>{empleado.nombre_completo}</td>
              <td>{empleado.dni}</td>
              <td>{empleado.correo}</td>
              <td>{empleado.celular || '—'}</td>
              <td>{empleado.area}</td>
              <td>{empleado.cargo}</td>
              <td>{empleado.estado}</td>
              {token && (
                <td>
                  <button onClick={() => handleEditar(empleado)}>Editar</button>
                  <button onClick={() => confirmarEliminacion(empleado)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarConfirmacion && (
        <div className="modal-confirmacion">
          <div className="modal-contenido">
            <p>¿Estás seguro de eliminar a <strong>{empleadoAEliminar?.nombre_completo}</strong>?</p>
            <div className="modal-acciones">
              <button onClick={eliminarEmpleado} className="btn-rojo">Sí, eliminar</button>
              <button onClick={() => setMostrarConfirmacion(false)} className="btn-gris">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
