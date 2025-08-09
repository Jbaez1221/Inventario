import { useState } from "react";
import axios from "../api/axios";

const TIPOS = [
  "Incidencia",
  "Consulta",
  "Mantenimiento"
];

const CATEGORIAS = [
  "SAP",
  "Office",
  "Soporte Tecnico",
  "Contraseñas",
  "Internet",
  "Catologo Toyota",
  "Catologo Hino",
  "Reportes",
  "Camaras"
];

const PRIORIDADES = [
  "Crítico",
  "Alta",
  "Media",
  "Baja"
];

export default function CrearTicketPublico() {
  const [form, setForm] = useState({
    dni: "",
    tipo: "",
    categoria: "",
    prioridad: "Media",
    observacion_inicial: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [codigo, setCodigo] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    setCodigo("");
    try {
      const res = await axios.post("/tickets/publico/crear", form);
      setCodigo(res.data.codigo);
      setMensaje("Ticket creado correctamente. Guarda tu código para seguimiento.");
    } catch (err) {
      if (err.response?.data?.error) {
        setMensaje(err.response.data.error);
      } else {
        setMensaje("Error al crear ticket");
      }
    }
  };

  return (
    <div className="formulario" style={{ maxWidth: 500 }}>
      <h2>Crear Ticket de Incidencia</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="dni"
          placeholder="DNI"
          required
          maxLength={8}
          minLength={8}
          pattern="\d{8}"
          value={form.dni}
          onChange={handleChange}
        />
        <select
          name="tipo"
          required
          value={form.tipo}
          onChange={handleChange}
        >
          <option value="">Seleccione tipo</option>
          {TIPOS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          name="categoria"
          required
          value={form.categoria}
          onChange={handleChange}
        >
          <option value="">Seleccione categoría</option>
          {CATEGORIAS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          name="prioridad"
          required
          value={form.prioridad}
          onChange={handleChange}
        >
          {PRIORIDADES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <textarea
          name="observacion_inicial"
          placeholder="Describe tu problema (observación inicial)"
          required
          value={form.observacion_inicial}
          onChange={handleChange}
        />
        <button type="submit" className="btn-primary">Enviar Ticket</button>
      </form>
      {mensaje && <div>{mensaje}</div>}
      {codigo && <div><b>Código de Ticket:</b> {codigo}</div>}
    </div>
  );
}