import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const Solicitudes = () => {
  const { token } = useAuth();
  
  const [dni, setDni] = useState("");
  const [tipoEquipo, setTipoEquipo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [motivo, setMotivo] = useState("");
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (token) {
      obtenerSolicitudes();
    }
  }, [token]);

  const obtenerSolicitudes = async () => {
    try {
      const res = await axiosBackend.get("/solicitudes");
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
    }
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    if (!dni.trim() || !tipoEquipo.trim() || !marca.trim() || !modelo.trim() || !motivo.trim()) {
      alert("Por favor, complete todos los campos del formulario.");
      return;
    }

    try {
      await axiosBackend.post("/solicitudes", {
        dni,
        tipo_equipo: tipoEquipo,
        marca,
        modelo,
        motivo,
        tipo: 'nuevo',
      });
      setMensaje("¡Solicitud enviada con éxito! Nuestro equipo de TI la revisará pronto.");
      setDni("");
      setTipoEquipo("");
      setMarca("");
      setModelo("");
      setMotivo("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al registrar la solicitud. Verifique el DNI e inténtalo de nuevo.";
      alert(errorMsg);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await axiosBackend.put(`/solicitudes/${id}`, { estado });
      obtenerSolicitudes();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo cambiar el estado de la solicitud.");
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "—";
    return new Date(fechaISO).toLocaleString("es-PE", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (token) {
    return (
      <div>
        <h2>Gestionar Solicitudes de Equipos</h2>
        <div className="tabla-container">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empleado</th>
                <th>Área</th>
                <th>Puesto</th>
                <th>Tipo de Solicitud</th> {/* CAMBIADO: Nueva columna */}
                <th>Equipo Solicitado</th>
                <th>Marca / Modelo</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td data-label="ID">{s.id}</td>
                  <td data-label="Empleado">{s.empleado_nombre || `(ID: ${s.empleado_id})`}</td>
                  <td data-label="Área">{s.empleado_area || '—'}</td>
                  <td data-label="Puesto">{s.empleado_puesto || '—'}</td>
                  <td data-label="Tipo de Solicitud">
                    <span className={`tipo-solicitud tipo-${s.tipo}`}>{s.tipo || 'N/A'}</span>
                  </td>
                  <td data-label="Equipo Solicitado">{s.tipo_equipo}</td>
                  <td data-label="Marca / Modelo">{s.marca} / {s.modelo}</td>
                  <td data-label="Motivo" className="celda-observaciones" title={s.motivo}>{s.motivo}</td>
                  <td data-label="Estado">
                    <span className={`estado-solicitud estado-${s.estado}`}>{s.estado}</span>
                  </td>
                  <td data-label="Fecha">{formatearFecha(s.fecha_solicitud)}</td>
                  <td data-label="Acciones" className="acciones">
                    {s.estado === "pendiente" ? (
                      <>
                        <button className="btn-success" onClick={() => cambiarEstado(s.id, "aprobada")}>
                          Aprobar
                        </button>
                        <button className="btn-danger" onClick={() => cambiarEstado(s.id, "rechazada")}>
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitud-public-container">
      <div className="solicitud-card">
        <h2>Solicitud de Nuevo Equipo</h2>
        <p className="solicitud-subtitle">
          Completa el formulario y nuestro equipo de TI evaluará tu solicitud.
        </p>
        
        {mensaje ? (
          <div className="mensaje-exito-grande">{mensaje}</div>
        ) : (
          <form onSubmit={enviarSolicitud} className="formulario">
            <input
              type="text"
              placeholder="Tu DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tipo de equipo (ej: Laptop, Monitor)"
              value={tipoEquipo}
              onChange={(e) => setTipoEquipo(e.target.value)}
            />
            <input
              type="text"
              placeholder="Marca del equipo"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
            <input
              type="text"
              placeholder="Modelo del equipo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe brevemente por qué necesitas el equipo"
              rows="4"
              style={{ gridColumn: '1 / -1' }}
            ></textarea>
            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>
              Enviar Solicitud
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;