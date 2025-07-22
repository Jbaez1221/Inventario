// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Equipos from "./pages/Equipos";
import Asignaciones from "./pages/asignaciones";
import HistorialEquipo from "./pages/HistorialEquipo";
import Navbar from "./components/Navbar";
import Empleados from "./pages/Empleados";
import Dashboard from "./pages/dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Equipos />} />
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/historial/:equipo_id" element={<HistorialEquipo />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
