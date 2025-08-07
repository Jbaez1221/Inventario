import { useEffect, useState, useCallback } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

const Usuarios = () => {
  const { token, user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", rol_id: "" });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const obtenerUsuarios = useCallback(async () => {
    try {
      const res = await axiosBackend.get("/usuarios", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch {
      setMensaje("Error al cargar usuarios");
    }
  }, [token]);

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
    obtenerUsuarios();
    obtenerRoles();
  }, [obtenerUsuarios, obtenerRoles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarUsuario = async () => {
    if (!form.username.trim() || (!modoEdicion && !form.password) || !form.rol_id) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }
    try {
      if (modoEdicion) {
        await axiosBackend.put(`/usuarios/${usuarioEditandoId}`, {
          username: form.username,
          password: form.password || undefined,
          rol_id: form.rol_id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axiosBackend.post("/usuarios", form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      cancelarEdicion();
      obtenerUsuarios();
      setMensaje("");
    } catch (err) {
      setMensaje(err.response?.data?.error || "Error al guardar usuario");
    }
  };

  const iniciarEdicion = (usuario) => {
    setForm({ username: usuario.username, password: "", rol_id: roles.find(r => r.nombre === usuario.rol)?.id || "" });
    setUsuarioEditandoId(usuario.id);
    setModoEdicion(true);
    setMensaje("");
    window.scrollTo(0, 0);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setUsuarioEditandoId(null);
    setForm({ username: "", password: "", rol_id: "" });
    setMensaje("");
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este usuario?")) return;
    try {
      await axiosBackend.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

      <div className="formulario">
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Nombre de usuario"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={modoEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
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
          <button onClick={guardarUsuario} className="btn-primary btn-icon" title={modoEdicion ? "Actualizar" : "Agregar"}>
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
                    onClick={() => iniciarEdicion(usuario)}
                    className="btn-primary btn-icon"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
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