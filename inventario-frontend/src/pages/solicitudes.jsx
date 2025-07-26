import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const Solicitudes = () => {
  const { token } = useAuth();
  const [dni, setDni] = useState("");
  const [tipoEquipo, setTipoEquipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const obtenerSolicitudes = async () => {
    try {
      const res = await axiosBackend.get("/solicitudes");
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
    }
  };

  const enviarSolicitud = async () => {
    if (!dni.trim() || !tipoEquipo || !motivo.trim()) {
      alert("Completa todos los campos");
      return;
    }

    try {
      await axiosBackend.post("/solicitudes", {
        dni,
        tipo_equipo: tipoEquipo,
        motivo,
      });
      alert("Solicitud registrada");
      setDni("");
      setTipoEquipo("");
      setMotivo("");
      obtenerSolicitudes();
    } catch (err) {
      if (err.response && err.response.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Error al registrar solicitud");
      }
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await axiosBackend.put(`/solicitudes/${id}`, { estado });
      obtenerSolicitudes();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo cambiar el estado");
    }
  };

  const formatearFecha = (fechaISO) => {
    const date = new Date(fechaISO);
    return date.toLocaleString("es-PE", { hour12: true });
  };

  return (
    <div className="solicitudes-container">
      <h2>Solicitudes de Equipos</h2>

      {/* Formulario */}
      <div className="formulario">
        <input
          type="text"
          placeholder="DNI del Empleado"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
        <select
          value={tipoEquipo}
          onChange={(e) => setTipoEquipo(e.target.value)}
        >
          <option value="">Tipo de equipo</option>
          <option value="Laptop">Laptop</option>
          <option value="PC">PC</option>
          <option value="Celular">Celular</option>
          <option value="Monitor">Monitor</option>
          <option value="Audífonos">Audífonos</option>
        </select>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo de la solicitud"
          rows={2}
        ></textarea>
        <div className="botones">
          <button onClick={enviarSolicitud} className="btn-primary">
            Enviar Solicitud
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado ID</th>
              <th>Tipo Equipo</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Fecha</th>
              {token && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id}>
                <td data-label="ID">{s.id}</td>
                <td data-label="Empleado ID">{s.empleado_id}</td>
                <td data-label="Tipo">{s.tipo_equipo}</td>
                <td data-label="Motivo">{s.motivo}</td>
                <td data-label="Estado">{s.estado}</td>
                <td data-label="Fecha">{formatearFecha(s.fecha_solicitud)}</td>
                {token && (
                  <td data-label="Acciones" className="acciones">
                    {s.estado === "pendiente" ? (
                      <>
                        <button
                          className="btn-primary"
                          onClick={() => cambiarEstado(s.id, "aprobada")}
                        >
                          Aprobar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => cambiarEstado(s.id, "rechazada")}
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Solicitudes;
