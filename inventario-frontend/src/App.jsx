// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";

import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal"; // Importar el modal
import Empleados from "./pages/Empleados";
import Equipos from "./pages/Equipos";
import Asignaciones from "./pages/asignaciones";
import HistorialEquipo from "./pages/HistorialEquipo";
import Dashboard from "./pages/dashboard";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/historial" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <LoginModal />
        <main className="container">
          <Routes>
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/asignaciones" element={<Asignaciones />} />
            <Route path="/historial" element={<HistorialEquipo />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/historial" />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
};

export default App;
