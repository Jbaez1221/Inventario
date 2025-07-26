import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  FaLaptop, FaUsers, FaClipboardList, FaHistory, FaTachometerAlt, 
  FaSignInAlt, FaSignOutAlt, FaFileAlt 
} from 'react-icons/fa';
import logo from '../assets/logo-corasur.png';
import "../App.css";

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const { token, logout, openLoginModal } = useAuth();

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    handleLinkClick();
  };

  const handleLogin = () => {
    openLoginModal();
    handleLinkClick();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen && <img src={logo} alt="Corasur Logo" className="sidebar-logo" />}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? '‹' : '›'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-links">
          <NavLink to="/equipos" className="nav-link" onClick={handleLinkClick}>
            <FaLaptop className="nav-icon" />
            {isOpen && "Equipos"}
          </NavLink>
          <NavLink to="/empleados" className="nav-link" onClick={handleLinkClick}>
            <FaUsers className="nav-icon" />
            {isOpen && "Empleados"}
          </NavLink>
          <NavLink to="/asignaciones" className="nav-link" onClick={handleLinkClick}>
            <FaClipboardList className="nav-icon" />
            {isOpen && "Asignaciones"}
          </NavLink>
          <NavLink to="/historial" className="nav-link" onClick={handleLinkClick}>
            <FaHistory className="nav-icon" />
            {isOpen && "Historial"}
          </NavLink>
          <NavLink to="/solicitudes" className="nav-link" onClick={handleLinkClick}>
            <FaFileAlt className="nav-icon" />
            {isOpen && "Solicitudes"}
          </NavLink>
          {token && (
            <NavLink to="/dashboard" className="nav-link" onClick={handleLinkClick}>
              <FaTachometerAlt className="nav-icon" />
              {isOpen && "Dashboard"}
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {token ? (
            <button onClick={handleLogout} className="nav-link btn-logout">
              <FaSignOutAlt className="nav-icon" />
              {isOpen && "Cerrar Sesión"}
            </button>
          ) : (
            <button onClick={handleLogin} className="nav-link btn-login">
              <FaSignInAlt className="nav-icon" />
              {isOpen && "Iniciar Sesión"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
