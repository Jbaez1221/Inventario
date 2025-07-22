// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-title">Inventario</div>
      <div className="navbar-links">
        <NavLink to="/empleados" className="nav-link">Empleados</NavLink>
        <NavLink to="/" className="nav-link">Equipos</NavLink>
        <NavLink to="/asignaciones" className="nav-link">Asignaciones</NavLink>
        <NavLink to="/historial/1" className="nav-link">Historial</NavLink>
        {/*<NavLink to="/equipos-admin" className="nav-link">Admin Equipos</NavLink>*/}
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
