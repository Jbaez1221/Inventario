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
      const res = await axiosBackend.post("/solicitudes", {
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
      <h2 className="text-2xl font-bold mb-4 text-center">Solicitudes de Equipos</h2>
      <hr className="mb-6 border-gray-600" />

      {/* Formulario siempre visible */}
      <div className="solicitudes-form">
        <input
          type="text"
          placeholder="DNI del Empleado"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="p-2 border rounded text-black"
        />
        <select
          value={tipoEquipo}
          onChange={(e) => setTipoEquipo(e.target.value)}
          className="p-2 border rounded text-black"
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
          className="p-2 border rounded text-black sm:col-span-2"
          placeholder="Motivo de la solicitud"
          rows={2}
        ></textarea>
        <button
          onClick={enviarSolicitud}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded sm:col-span-2"
        >
          Enviar Solicitud
        </button>
      </div>

      <table className="solicitudes-table">
        <thead>
          <tr className="bg-gray-800 text-center">
            <th className="p-2">ID</th>
            <th className="p-2">Empleado ID</th>
            <th className="p-2">Tipo Equipo</th>
            <th className="p-2">Motivo</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Fecha</th>
            {token && <th className="p-2">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => (
            <tr key={s.id} className="text-center border-t border-gray-700">
              <td>{s.id}</td>
              <td>{s.empleado_id}</td>
              <td>{s.tipo_equipo}</td>
              <td>{s.motivo}</td>
              <td>{s.estado}</td>
              <td>{formatearFecha(s.fecha_solicitud)}</td>
              {token && (
                <td>
                  {s.estado === "pendiente" ? (
                    <>
                      <button
                        className="btn-aprobar"
                        onClick={() => cambiarEstado(s.id, "aprobada")}
                      >
                        Aprobar
                      </button>
                      <button
                        className ="btn-rechazar"
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
  );
};

export default Solicitudes;
