import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FaLaptop, FaUsers, FaClipboardList, FaHistory, FaTachometerAlt,
  FaSignInAlt, FaSignOutAlt, FaFileAlt, FaUserShield, FaChevronDown, FaChevronRight,
  FaUserCog, FaBuilding, FaCogs, FaTicketAlt, FaLayerGroup
} from 'react-icons/fa';
import logo from '../assets/logo-corasur.png';
import "../App.css";

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const { token, user, logout, openLoginModal } = useAuth();

  const [openAdmin, setOpenAdmin] = useState(true);
  const [openRRHH, setOpenRRHH] = useState(true);
  const [openSistemas, setOpenSistemas] = useState(true);
  const [openInventariado, setOpenInventariado] = useState(true);
  const [openTickets, setOpenTickets] = useState(true);

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const rol = user?.user?.rol;

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

            {!token && (
              <>
                <div className="sidebar-section">
                  <div className="sidebar-section-title">
                    <FaBuilding className="nav-icon" />
                    {isOpen && "Recursos Humanos"}
                  </div>
                  <NavLink to="/empleados" className="nav-link" onClick={handleLinkClick}>
                    <FaUsers className="nav-icon" />
                    {isOpen && "Empleados"}
                  </NavLink>
                </div>

                <div className="sidebar-section">
                  <div className="sidebar-section-title">
                    <FaCogs className="nav-icon" />
                    {isOpen && "Sistemas"}
                  </div>
                  
                  <div className="sidebar-subsection">
                    <div className="sidebar-subsection-title">
                      <FaTicketAlt className="nav-icon" />
                      {isOpen && "Asistencias"}
                    </div>
                    <NavLink to="/tickets/crear" className="nav-link nav-link-sub" onClick={handleLinkClick}>
                      <FaTicketAlt className="nav-icon" />
                      {isOpen && "Crear Ticket"}
                    </NavLink>
                    <NavLink to="/tickets/estado" className="nav-link nav-link-sub" onClick={handleLinkClick}>
                      <FaTicketAlt className="nav-icon" />
                      {isOpen && "Estado Ticket"}
                    </NavLink>
                    <NavLink to="/tickets/soluciones" className="nav-link nav-link-sub" onClick={handleLinkClick}>
                      <FaTicketAlt className="nav-icon" />
                      {isOpen && "Soluciones Tickets"}
                    </NavLink>
                  </div>

                  <div className="sidebar-subsection">
                    <div className="sidebar-subsection-title">
                      <FaLayerGroup className="nav-icon" />
                      {isOpen && "Inventario"}
                    </div>
                    <NavLink to="/equipos" className="nav-link nav-link-sub" onClick={handleLinkClick}>
                      <FaLaptop className="nav-icon" />
                      {isOpen && "Equipos"}
                    </NavLink>
                    <NavLink to="/historial" className="nav-link nav-link-sub" onClick={handleLinkClick}>
                      <FaHistory className="nav-icon" />
                      {isOpen && "Historial"}
                    </NavLink>
                    <NavLink to="/solicitudes" className="nav-link nav-link-sub" onClick={handleLinkClick}>
                      <FaFileAlt className="nav-icon" />
                      {isOpen && "Solicitudes"}
                    </NavLink>
                  </div>
                </div>
              </>
            )}

          {token && (
            <>
              {rol === "admin" && (
                <div className="sidebar-group">
                  <div className="sidebar-group-title" onClick={() => setOpenAdmin(!openAdmin)}>
                    {openAdmin ? <FaChevronDown /> : <FaChevronRight />}
                    <FaUserCog className="nav-icon" />
                    {isOpen && "Administrador"}
                  </div>
                  {openAdmin && (
                    <div className="sidebar-group-items">
                      <NavLink to="/usuarios" className="nav-link" onClick={handleLinkClick}>
                        <FaUsers className="nav-icon" />
                        {isOpen && "Usuarios"}
                      </NavLink>
                      <NavLink to="/roles" className="nav-link" onClick={handleLinkClick}>
                        <FaUserShield className="nav-icon" />
                        {isOpen && "Roles"}
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              {(rol === "admin" || rol === "rrhh") && (
                <div className="sidebar-group">
                  <div className="sidebar-group-title" onClick={() => setOpenRRHH(!openRRHH)}>
                    {openRRHH ? <FaChevronDown /> : <FaChevronRight />}
                    <FaBuilding className="nav-icon" />
                    {isOpen && "RRHH"}
                  </div>
                  {openRRHH && (
                    <div className="sidebar-group-items">
                      <NavLink to="/empleados" className="nav-link" onClick={handleLinkClick}>
                        <FaUsers className="nav-icon" />
                        {isOpen && "Empleados"}
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              {(rol === "admin" || rol === "sistemas" || rol === "tecnico sistemas") && (
                <div className="sidebar-group">
                  <div className="sidebar-group-title" onClick={() => setOpenSistemas(!openSistemas)}>
                    {openSistemas ? <FaChevronDown /> : <FaChevronRight />}
                    <FaCogs className="nav-icon" />
                    {isOpen && "Sistemas"}
                  </div>
                  {openSistemas && (
                    <div className="sidebar-group-items">
                      {(rol === "admin" || rol === "sistemas") && (
                        <div className="sidebar-group">
                          <div className="sidebar-group-title" onClick={() => setOpenInventariado(!openInventariado)}>
                            {openInventariado ? <FaChevronDown /> : <FaChevronRight />}
                            <FaLayerGroup className="nav-icon" />
                            {isOpen && "Inventariado"}
                          </div>
                          {openInventariado && (
                            <div className="sidebar-group-items">
                              <NavLink to="/equipos" className="nav-link" onClick={handleLinkClick}>
                                <FaLaptop className="nav-icon" />
                                {isOpen && "Equipos"}
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
                            </div>
                          )}
                        </div>
                      )}
                      <div className="sidebar-group">
                        <div className="sidebar-group-title" onClick={() => setOpenTickets(!openTickets)}>
                          {openTickets ? <FaChevronDown /> : <FaChevronRight />}
                          <FaTicketAlt className="nav-icon" />
                          {isOpen && "Tickets"}
                        </div>
                        {openTickets && (
                          <div className="sidebar-group-items">
                            <NavLink to="/tickets" className="nav-link" onClick={handleLinkClick}>
                              <FaTicketAlt className="nav-icon" />
                              {isOpen && "Gestión de Tickets"}
                            </NavLink>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <NavLink to="/dashboard" className="nav-link" onClick={handleLinkClick}>
                <FaTachometerAlt className="nav-icon" />
                {isOpen && "Dashboard"}
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          {token ? (
            <button onClick={logout} className="nav-link btn-logout">
              <FaSignOutAlt className="nav-icon" />
              {isOpen && "Cerrar Sesión"}
            </button>
          ) : (
            <button onClick={openLoginModal} className="nav-link btn-login">
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
