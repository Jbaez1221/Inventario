import { useEffect, useState } from "react";
import { getClientes, getItems, crearOrden } from "../../api/ventasApi";

export default function NuevaOrden() {
  const [clientes, setClientes] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ CardCode: "", DocDueDate: "", DocumentLines: [] });

  useEffect(() => {
    getClientes().then(setClientes);
    getItems().then(setItems);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orden = await crearOrden(form);
    alert("Orden creada con ID: " + orden.DocEntry);
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Nueva Orden de Venta</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <select
          value={form.CardCode}
          onChange={(e) => setForm({ ...form, CardCode: e.target.value })}
        >
          <option value="">-- Seleccionar Cliente --</option>
          {clientes.map(c => (
            <option key={c.CardCode} value={c.CardCode}>
              {c.CardName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.DocDueDate}
          onChange={(e) => setForm({ ...form, DocDueDate: e.target.value })}
        />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Crear Orden
        </button>
      </form>
    </div>
  );
}
