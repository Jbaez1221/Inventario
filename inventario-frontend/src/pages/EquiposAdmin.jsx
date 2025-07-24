import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";

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
    } catch{
      alert("Error al agregar equipo");
    }
  };

  const eliminarEquipo = async (id) => {
    if (!confirm("¿Eliminar este equipo?")) return;

    try {
      await axiosBackend.delete(`/equipos/${id}`);
      obtenerEquipos();
    } catch{
      alert("No se pudo eliminar");
    }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Gestión de Equipos</h2>

      <div className="mb-6 flex flex-wrap gap-2 items-end">
        <div>
          <label className="block">Tipo:</label>
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="p-2 border rounded text-black"
            placeholder="Laptop, Celular..."
          />
        </div>
        <div>
          <label className="block">Serie:</label>
          <input
            type="text"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="p-2 border rounded text-black"
            placeholder="N° de serie"
          />
        </div>
        <button
          className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
          onClick={registrarEquipo}
        >
          Agregar
        </button>
      </div>

      <table className="w-full table-auto border border-gray-600">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2">ID</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Serie</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((eq) => (
            <tr key={eq.id} className="text-center border-t border-gray-700">
              <td>{eq.id}</td>
              <td>{eq.tipo}</td>
              <td>{eq.serie}</td>
              <td>{eq.estado}</td>
              <td>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
  );
};

export default EquiposAdmin;
