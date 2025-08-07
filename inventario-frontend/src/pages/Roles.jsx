import { useEffect, useState, useCallback } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

const Roles = () => {
  const { token, user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rolEditandoId, setRolEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const obtenerRoles = useCallback(async () => {
    try {
      const res = await axiosBackend.get("/roles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data);
    } catch {
      setMensaje("Error al cargar roles");
    }
  }, [token]);

  useEffect(() => {
    obtenerRoles();
  }, [obtenerRoles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarRol = async () => {
    if (!form.nombre.trim()) {
      setMensaje("El nombre del rol es obligatorio.");
      return;
    }
    try {
      if (modoEdicion) {
        await axiosBackend.put(`/roles/${rolEditandoId}`, { nombre: form.nombre }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axiosBackend.post("/roles", { nombre: form.nombre }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      cancelarEdicion();
      obtenerRoles();
      setMensaje("");
    } catch (err) {
      setMensaje(err.response?.data?.error || "Error al guardar rol");
    }
  };

  const iniciarEdicion = (rol) => {
    setForm({ nombre: rol.nombre });
    setRolEditandoId(rol.id);
    setModoEdicion(true);
    setMensaje("");
    window.scrollTo(0, 0);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setRolEditandoId(null);
    setForm({ nombre: "" });
    setMensaje("");
  };

  const eliminarRol = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este rol?")) return;
    try {
      await axiosBackend.delete(`/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      obtenerRoles();
      setMensaje("");
    } catch (err) {
      setMensaje(err.response?.data?.error || "Error al eliminar rol");
    }
  };

  if (!user?.user?.rol || user.user.rol !== "admin") {
    return <div>No tienes permisos para ver esta sección.</div>;
  }

  return (
    <div>
      <h2>Gestión de Roles</h2>
      {mensaje && <div className="mensaje-error">{mensaje}</div>}

      <div className="formulario">
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre del rol"
        />
        <div className="botones">
          <button onClick={guardarRol} className="btn-primary btn-icon" title={modoEdicion ? "Actualizar" : "Agregar"}>
            {modoEdicion ? <FaEdit /> : <FaPlus />}
          </button>
          {modoEdicion && (
            <button onClick={cancelarEdicion} className="btn-secondary btn-icon" title="Cancelar">
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id}>
                <td>{rol.id}</td>
                <td>{rol.nombre}</td>
                <td className="acciones">
                  <button
                    onClick={() => iniciarEdicion(rol)}
                    className="btn-primary btn-icon"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => eliminarRol(rol.id)}
                    className="btn-danger btn-icon"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Roles;