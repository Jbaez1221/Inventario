import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

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
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarEmpleado = async () => {
    const camposRequeridos = ['nombre_completo', 'dni', 'correo', 'area', 'cargo'];
    for (const campo of camposRequeridos) {
      if (!form[campo].trim()) {
        alert(`El campo ${campo.replace('_', ' ')} es obligatorio.`);
        return;
      }
    }

    try {
      if (modoEdicion) {
        await axiosBackend.put(`/empleados/${empleadoEditandoId}`, form);
      } else {
        await axiosBackend.post("/empleados", form);
      }
      cancelarEdicion();
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
    if (!empleadoAEliminar) return;
    try {
      await axiosBackend.delete(`/empleados/${empleadoAEliminar.id}`);
      setMostrarConfirmacion(false);
      setEmpleadoAEliminar(null);
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
    window.scrollTo(0, 0);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEmpleadoEditandoId(null);
    setForm({
      nombre_completo: "", dni: "", correo: "", area: "",
      cargo: "", estado: "Activo", celular: ""
    });
  };

  const empleadosFiltrados = empleados.filter((empleado) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(empleado).some(val =>
      String(val).toLowerCase().includes(busquedaLower)
    );
  });

  return (
    <div>
      <h2>Empleados</h2>

      {token && (
        <div className="formulario">
          <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} placeholder="Nombre completo" />
          <input name="dni" value={form.dni} onChange={handleChange} placeholder="DNI" />
          <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="Correo" />
          <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular (opcional)" />
          <input name="area" value={form.area} onChange={handleChange} placeholder="Área" />
          <input name="cargo" value={form.cargo} onChange={handleChange} placeholder="Cargo" />
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <div className="botones">
            <button onClick={guardarEmpleado} className="btn-primary">{modoEdicion ? "Actualizar" : "Agregar"}</button>
            {modoEdicion && <button onClick={cancelarEdicion} className="btn-secondary">Cancelar</button>}
          </div>
        </div>
      )}

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, correo, área..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")} className="btn-secondary">Limpiar</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
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
                  <td className="acciones">
                    <button onClick={() => handleEditar(empleado)} className="btn-primary btn-icon" title="Editar">
                      <FaPencilAlt />
                    </button>
                    <button onClick={() => confirmarEliminacion(empleado)} className="btn-danger btn-icon" title="Eliminar">
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarConfirmacion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={() => setMostrarConfirmacion(false)}>&times;</button>
            <h4>Confirmar Eliminación</h4>
            <p>¿Estás seguro de eliminar a <strong>{empleadoAEliminar?.nombre_completo}</strong>?</p>
            <div className="modal-actions">
              <button onClick={() => setMostrarConfirmacion(false)} className="btn-secondary">Cancelar</button>
              <button onClick={eliminarEmpleado} className="btn-danger">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
