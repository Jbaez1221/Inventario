// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Equipos from "../pages/Equipos";
import Asignaciones from "../pages/asignaciones"; // 👈 importar
import HistorialEquipo from "../pages/HistorialEquipo";
import EquiposAdmin from "./pages/EquiposAdmin";
import Solicitudes from "../pages/solicitudes";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Equipos />} />
      <Route path="/asignaciones" element={<Asignaciones />} /> {/* 👈 ruta */}
      <Route path="/historial/:equipo_id" element={<HistorialEquipo />} />
      <Route path="/equipos-admin" element={<EquiposAdmin />} />
      <Route path="/solicitudes" element={<Solicitudes />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;

