import { useEffect, useState } from "react";
import axiosBackend from "../../api/axios";

const EquiposAdmin = () => {
  const [equipos, setEquipos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [serie, setSerie] = useState("");

  useEffect(() => {
    obtenerEquipos();
  }, []);

  const obtenerEquipos = async () => {
    const res = await axiosBackend.get("/equipos");
    setEquipos(res.data);
  };

  const registrarEquipo = async () => {
    if (!tipo.trim() || !serie.trim()) return alert("Completa los campos");

    try {
      await axiosBackend.post("/equipos", { tipo, serie });
      setTipo("");
      setSerie("");
      obtenerEquipos();
    } catch {
      alert("Error al agregar equipo");
    }
  };

  const eliminarEquipo = async (id) => {
    if (!confirm("¿Eliminar este equipo?")) return;

    try {
      await axiosBackend.delete(`/equipos/${id}`);
      obtenerEquipos();
    } catch {
      alert("No se pudo eliminar");
    }
  };

  return (
    <div>
      <h2>Gestión de Equipos (Admin)</h2>

      <div className="formulario" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Laptop, Celular..."
        />
        <input
          type="text"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          placeholder="N° de serie"
        />
        <div className="botones">
          <button onClick={registrarEquipo}>Agregar</button>
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Serie</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((eq) => (
              <tr key={eq.id}>
                <td>{eq.id}</td>
                <td>{eq.tipo}</td>
                <td>{eq.serie}</td>
                <td>{eq.estado}</td>
                <td>
                  <button
                    style={{ backgroundColor: '#d32f2f', color: 'white' }}
                    onClick={() => eliminarEquipo(eq.id)}
                  >
                    Eliminar
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

export default EquiposAdmin;
