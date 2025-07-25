import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

const Empleados = () => {
  const { token } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  
  const formInicial = {
    nombres: "",
    apellidos: "",
    dni: "",
    correo_institucional: "",
    correo_personal: "",
    area: "",
    puesto: "",
    estado: "Activo",
    telefono_coorporativo: "",
    telefono_personal: "",
    sede: "",
  };
  const [form, setForm] = useState(formInicial);

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
    const camposRequeridos = [
      'nombres', 'apellidos', 'dni', 'correo_personal', 
      'area', 'puesto', 'telefono_coorporativo', 'telefono_personal', 'sede'
    ];
    for (const campo of camposRequeridos) {
      if (!form[campo] || !form[campo].trim()) {
        alert(`El campo ${campo.replace(/_/g, ' ')} es obligatorio.`);
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
    setForm(formInicial);
  };

  const empleadosFiltrados = empleados.filter((empleado) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(empleado).some(val =>
      val && String(val).toLowerCase().includes(busquedaLower)
    );
  });

  return (
    <div>
      <h2>Empleados</h2>

      {token && (
        <div className="formulario">
          <input name="nombres" value={form.nombres} onChange={handleChange} placeholder="Nombres" />
          <input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Apellidos" />
          <input name="dni" value={form.dni} onChange={handleChange} placeholder="DNI" />
          <input name="correo_personal" type="email" value={form.correo_personal} onChange={handleChange} placeholder="Correo Personal" />
          <input name="correo_institucional" type="email" value={form.correo_institucional} onChange={handleChange} placeholder="Correo Institucional (Opcional)" />
          <input name="telefono_personal" value={form.telefono_personal} onChange={handleChange} placeholder="Teléfono Personal" />
          <input name="telefono_coorporativo" value={form.telefono_coorporativo} onChange={handleChange} placeholder="Teléfono Corporativo" />
          <input name="area" value={form.area} onChange={handleChange} placeholder="Área" />
          <input name="puesto" value={form.puesto} onChange={handleChange} placeholder="Puesto" />
          <input name="sede" value={form.sede} onChange={handleChange} placeholder="Sede" />
          
          {modoEdicion && (
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          )}

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
              <th>Nombre Completo</th>
              <th>DNI</th>
              <th>Correo Personal</th>
              <th>Correo Institucional</th>
              <th>Teléfono Personal</th>
              <th>Teléfono Corporativo</th>
              <th>Puesto</th>
              <th>Área</th>
              <th>Sede</th>
              <th>Estado</th>
              {token && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map((empleado, index) => (
              <tr key={empleado.id}>
                <td data-label="N°">{index + 1}</td>
                <td data-label="Nombre Completo">{`${empleado.nombres} ${empleado.apellidos}`}</td>
                <td data-label="DNI">{empleado.dni}</td>
                <td data-label="Correo Personal">{empleado.correo_personal}</td>
                <td data-label="Correo Institucional">{empleado.correo_institucional || "—"}</td>
                <td data-label="Teléfono Personal">{empleado.telefono_personal || "—"}</td>
                <td data-label="Teléfono Corporativo">{empleado.telefono_coorporativo || "—"}</td>
                <td data-label="Puesto">{empleado.puesto}</td>
                <td data-label="Área">{empleado.area}</td>
                <td data-label="Sede">{empleado.sede}</td>
                <td data-label="Estado">{empleado.estado}</td>
                {token && (
                  <td data-label="Acciones" className="acciones">
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
            <p>¿Estás seguro de eliminar a <strong>{`${empleadoAEliminar?.nombres} ${empleadoAEliminar?.apellidos}`}</strong>?</p>
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
