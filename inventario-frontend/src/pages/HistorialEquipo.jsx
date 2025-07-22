import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";


const HistorialEquipo = () => {
  const { equipo_id } = useParams();
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await axiosBackend.get(`/asignaciones/historial/${equipo_id}`);
        console.log("Historial:", res.data);
        setHistorial(res.data);
      } catch (error) {
        console.error("Error al obtener historial:", error);
        alert("Error al cargar historial");
      }
    };
    fetchHistorial();
  }, [equipo_id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "No devuelto";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-PE");
  };

  return (
    <div className="historial-container">
      <h2 className="historial-titulo">Historial del Equipo #{equipo_id}</h2>
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
          {historial.length === 0 ? (
            <tr>
              <td colSpan="4" className="sin-datos">Sin historial disponible</td>
            </tr>
          ) : (
            historial.map((item, index) => (
              <tr key={index}>
                <td>{item.nombre_empleado || "—"}</td>
                <td>{formatearFecha(item.fecha_entrega)}</td>
                <td>{formatearFecha(item.fecha_devolucion)}</td>
                <td>{item.observaciones || "No hay Observaciones"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialEquipo;
