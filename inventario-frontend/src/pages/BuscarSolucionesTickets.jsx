import { useState } from "react";
import axios from "axios";

export default function BuscarSolucionesTickets() {
  const [filtros, setFiltros] = useState({ categoria: "", tipo: "", palabra: "" });
  const [resultados, setResultados] = useState([]);

  const handleChange = e => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const handleBuscar = async e => {
    e.preventDefault();
    const res = await axios.get("http://localhost:4002/tickets/publico/buscar", { params: filtros });
    setResultados(res.data);
  };

  return (
    <div className="formulario" style={{ maxWidth: 700 }}>
      <h2>Buscar Soluciones de Tickets Cerrados</h2>
      <form onSubmit={handleBuscar} style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <input name="categoria" placeholder="Categoría" onChange={handleChange} />
        <input name="tipo" placeholder="Tipo" onChange={handleChange} />
        <input name="palabra" placeholder="Palabra clave en solución" onChange={handleChange} />
        <button type="submit" className="btn-primary">Buscar</button>
      </form>
      <ul>
        {resultados.map(t => (
          <li key={t.codigo} style={{ marginBottom: 18, background: "#23272f", borderRadius: 8, padding: 12 }}>
            <b>{t.codigo}</b> [{t.categoria} - {t.tipo}]<br />
            <b>Solución:</b> {t.solucion || "Sin solución registrada"}
          </li>
        ))}
      </ul>
    </div>
  );
}