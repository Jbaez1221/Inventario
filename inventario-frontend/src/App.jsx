import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Equipos from "./pages/Inventariado/Equipos";
import EquiposAdmin from "./pages/Inventariado/EquiposAdmin";
import Empleados from "./pages/RRHH/Empleados";
import GestionarEmpleado from "./pages/RRHH/GestionarEmpleado";
import Asignaciones from "./pages/Inventariado/asignaciones";
import HistorialEquipo from "./pages/Inventariado/HistorialEquipo";
import Dsistemas from "./pages/Dashboard/Dsistemas";
import Dtaller from "./pages/Dashboard/DTaller";
import Drrhh from "./pages/Dashboard/Drrhh";
import Solicitudes from "./pages/Inventariado/solicitudes";
import Roles from "./pages/Administrador/Roles";
import Usuarios from "./pages/Administrador/Usuarios";
import CrearTicketPublico from "./pages/Ticket/CrearTicketPublico";
import EstadoTicketPublico from "./pages/Ticket/EstadoTicketPublico";
import BuscarSolucionesTickets from "./pages/Ticket/BuscarSolucionesTickets";
import TicketsGestion from "./pages/Ticket/TicketsGestion";
import TicketDetalle from "./pages/Ticket/TicketDetalle";
import BuscarInfo from "./pages/Buscar/BuscarInfo";
import BuscarSAP from "./pages/Buscar/BuscarSap";
import Tarifario from "./pages/Precio/Tarifario";
import Log from "./pages/Login/Log";

const RedirectTicketWithId = () => {
  const id = window.location.pathname.split('/').pop();
  return <Navigate to={`/ticket-detalle/${id}`} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Log />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<Home />} />
            <Route path="equipos" element={<Equipos />} />
            <Route path="equipos-admin" element={<EquiposAdmin />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="empleados/gestionar" element={<GestionarEmpleado />} />
            <Route path="empleados/gestionar/:id" element={<GestionarEmpleado />} />
            <Route path="asignaciones" element={<Asignaciones />} />
            <Route path="historial" element={<HistorialEquipo />} />
            <Route path="solicitudes" element={<Solicitudes />} />
            <Route path="dashboard-sistemas" element={<Dsistemas/>} />
            <Route path="dashboard-rrhh" element={<Drrhh/>} />
            <Route path="dashboard-taller" element={<Dtaller/>} />
            <Route path="roles" element={<Roles />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="crear-ticket-publico" element={<CrearTicketPublico />} />
            <Route path="estado-ticket-publico" element={<EstadoTicketPublico />} />
            <Route path="buscar-soluciones-tickets" element={<BuscarSolucionesTickets />} />
            <Route path="tarifario" element={<Tarifario />} />
            <Route path="buscar-info" element={<BuscarInfo />} />
            <Route path="buscar-sap" element={<BuscarSAP />} />
            <Route path="tickets-gestion" element={<TicketsGestion />} />
            <Route path="ticket-detalle/:id" element={<TicketDetalle />} />

            {/* Redirecciones */}
            <Route path="tickets/crear" element={<Navigate to="/crear-ticket-publico" replace />} />
            <Route path="tickets/estado" element={<Navigate to="/estado-ticket-publico" replace />} />
            <Route path="tickets/soluciones" element={<Navigate to="/buscar-soluciones-tickets" replace />} />
            <Route path="tickets" element={<Navigate to="/tickets-gestion" replace />} />
            <Route path="tickets/:id" element={<RedirectTicketWithId />} />
          </Route>
        </Routes>

      </AuthProvider>
    </Router >
  );
}

export default App;
