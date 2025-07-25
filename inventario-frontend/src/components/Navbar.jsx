import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


const Navbar = () => {
  const { token, logout, openLoginModal } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">CORASUR</div>

      <nav className="sidebar-nav">
        <NavLink to="/historial" className="sidebar-link">Historial</NavLink>
        <NavLink to="/asignaciones" className="sidebar-link">Asignaciones</NavLink>
        <NavLink to="/equipos" className="sidebar-link">Equipos</NavLink>
        <NavLink to="/empleados" className="sidebar-link">Empleados</NavLink>
        <NavLink to="/solicitudes" className="sidebar-link">Solicitudes</NavLink>
        {token && <NavLink to="/dashboard" className="sidebar-link">Dashboard</NavLink>}
      </nav>

      <div className="sidebar-footer">
        {token ? (
          <button onClick={logout} className="sidebar-btn logout">Cerrar Sesión</button>
        ) : (
          <button onClick={openLoginModal} className="sidebar-btn login">Iniciar Sesión</button>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
