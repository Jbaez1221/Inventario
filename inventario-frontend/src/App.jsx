import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Equipos from "./pages/Equipos";
import EquiposAdmin from "./pages/EquiposAdmin";
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
import BuscarInfo from "./pages/BuscarInfo";
import BuscarSAP from "./pages/BuscarSap";
import Tarifario from "./pages/Tarifario";

const RedirectTicketWithId = () => {
  const id = window.location.pathname.split('/').pop();
  return <Navigate to={`/ticket-detalle/${id}`} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />

            <Route path="equipos" element={<Equipos />} />
            <Route path="equipos-admin" element={
              <ProtectedRoute>
                <EquiposAdmin />
              </ProtectedRoute>
            } />
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
            
            <Route path="crear-ticket-publico" element={<CrearTicketPublico />} />
            <Route path="estado-ticket-publico" element={<EstadoTicketPublico />} />
            <Route path="buscar-soluciones-tickets" element={<BuscarSolucionesTickets />} />

            <Route path="tarifario"  element={<Tarifario/>}/>
            <Route path="buscar-info" element={<BuscarInfo/>}/>
            <Route path="buscar-sap" element={<BuscarInfo/>}/>

            <Route
              path="tickets-gestion"
              element={
                <ProtectedRoute>
                  <TicketsGestion/>
                </ProtectedRoute>
              }
            />
            <Route
              path="ticket-detalle/:id"
              element={
                <ProtectedRoute>
                  <TicketDetalle />
                </ProtectedRoute>
              }
            />

            <Route path="tickets/crear" element={<Navigate to="/crear-ticket-publico" replace />} />
            <Route path="tickets/estado" element={<Navigate to="/estado-ticket-publico" replace />} />
            <Route path="tickets/soluciones" element={<Navigate to="/buscar-soluciones-tickets" replace />} />
            <Route path="tickets" element={<Navigate to="/tickets-gestion" replace />} />
            <Route path="tickets/:id" element={<RedirectTicketWithId />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
