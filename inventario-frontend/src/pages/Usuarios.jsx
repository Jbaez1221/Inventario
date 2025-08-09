import { useEffect, useState, useCallback } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ dni: "", rol_id: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [passwordGenerada, setPasswordGenerada] = useState("");

  const obtenerUsuarios = useCallback(async () => {
    try {
      const res = await axiosBackend.get("/usuarios");
      setUsuarios(res.data);
    } catch {
      setMensaje("Error al cargar usuarios");
    }
  }, []);

  const obtenerRoles = useCallback(async () => {
    try {
      const res = await axiosBackend.get("/roles");
      setRoles(res.data);
    } catch {
      setMensaje("Error al cargar roles");
    }
  }, []);

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
  }, [obtenerUsuarios, obtenerRoles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarUsuario = async () => {
    if (!form.dni.trim() || !form.rol_id) {
      setMensaje("DNI y rol son obligatorios.");
      return;
    }
    try {
      const res = await axiosBackend.post("/usuarios", form);
      setPasswordGenerada(res.data.password_generada || "");
      setMensaje("Usuario creado correctamente.");
      cancelarEdicion();
      obtenerUsuarios();
    } catch (err) {
      setMensaje(err.response?.data?.error || "Error al guardar usuario");
    }
  };


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setForm({ dni: "", rol_id: "" });
    setMensaje("");
    setPasswordGenerada("");
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este usuario?")) return;
    try {
      await axiosBackend.delete(`/usuarios/${id}`);
      obtenerUsuarios();
      setMensaje("");
    } catch (err) {
      setMensaje(err.response?.data?.error || "Error al eliminar usuario");
    }
  };

  if (!user?.user?.rol || user.user.rol !== "admin") {
    return <div>No tienes permisos para ver esta sección.</div>;
  }

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      {mensaje && <div className="mensaje-error">{mensaje}</div>}
      {passwordGenerada && (
        <div className="mensaje-info">
          <b>Contraseña generada:</b> {passwordGenerada}
        </div>
      )}

      <div className="formulario">
        <input
          name="dni"
          value={form.dni}
          onChange={handleChange}
          placeholder="DNI del empleado"
          maxLength={8}
        />
        <select
          name="rol_id"
          value={form.rol_id}
          onChange={handleChange}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
          ))}
        </select>
        <div className="botones">
          <button onClick={guardarUsuario} className="btn-primary btn-icon" title="Agregar">
            <FaPlus />
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
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.rol}</td>
                <td className="acciones">
                  <button
                    onClick={() => eliminarUsuario(usuario.id)}
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

export default Usuarios;