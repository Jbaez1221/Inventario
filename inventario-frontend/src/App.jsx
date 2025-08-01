import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Equipos from "./pages/Equipos";
import Empleados from "./pages/Empleados";
import Asignaciones from "./pages/asignaciones";
import HistorialEquipo from "./pages/HistorialEquipo";
import Dashboard from "./pages/dashboard";
import Solicitudes from "./pages/solicitudes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/equipos" replace />} />

            <Route path="equipos" element={<Equipos />} />
            <Route path="empleados" element={<Empleados />} />
            <Route
              path="asignaciones"
              element={
                <ProtectedRoute>
                  <Asignaciones />
                </ProtectedRoute>
              }
            />
            <Route path="historial" element={<HistorialEquipo />} />
            <Route path="solicitudes" element={<Solicitudes />} />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
