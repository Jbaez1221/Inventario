import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../App.css";

const Navbar = () => {
  const { token, logout, openLoginModal } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-title">CORASUR</div>
      <div className="navbar-links">
        <NavLink to="/historial" className="nav-link">Historial</NavLink>
        <NavLink to="/asignaciones" className="nav-link">Asignaciones</NavLink>
        <NavLink to="/equipos" className="nav-link">Equipos</NavLink>
        <NavLink to="/empleados" className="nav-link">Empleados</NavLink>
        {token && (
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        )}
      </div>
      <div className="navbar-auth">
        {token ? (
          <button onClick={logout} className="btn-logout">
            Cerrar Sesión
          </button>
        ) : (
          <button onClick={openLoginModal} className="btn-login">
            Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
