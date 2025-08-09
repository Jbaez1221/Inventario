import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Equipos from "./pages/Equipos";
import Empleados from "./pages/Empleados";
import GestionarEmpleado from "./pages/GestionarEmpleado";
import Asignaciones from "./pages/asignaciones";
import HistorialEquipo from "./pages/HistorialEquipo";
import Dashboard from "./pages/dashboard";
import Solicitudes from "./pages/solicitudes";
import Roles from "./pages/Roles";
import Usuarios from "./pages/Usuarios";
import CrearTicketPublico from "./pages/CrearTicketPublico";
import EstadoTicketPublico from "./pages/EstadoTicketPublico";
import BuscarSolucionesTickets from "./pages/BuscarSolucionesTickets";
import TicketsGestion from "./pages/TicketsGestion";
import TicketDetalle from "./pages/TicketDetalle";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/equipos" replace />} />

            <Route path="equipos" element={<Equipos />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="empleados/gestionar" element={<GestionarEmpleado />} />
            <Route path="empleados/gestionar/:id" element={<GestionarEmpleado />} />
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
            <Route
              path="roles"
              element={
                <ProtectedRoute>
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route path="tickets/crear" element={<CrearTicketPublico />} />
            <Route path="tickets/estado" element={<EstadoTicketPublico />} />
            <Route path="tickets/soluciones" element={<BuscarSolucionesTickets />} />

            <Route
              path="tickets"
              element={
                <ProtectedRoute>
                  <TicketsGestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetalle />
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
