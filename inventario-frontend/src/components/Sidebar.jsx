import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axiosBackend from '../api/axios';
import {
  FaLaptop, FaUsers, FaClipboardList, FaHistory, FaTachometerAlt,
  FaSignInAlt, FaSignOutAlt, FaFileAlt, FaUserShield, FaChevronDown, FaChevronRight,
  FaUserCog, FaBuilding, FaCogs, FaTicketAlt, FaLayerGroup, FaHome, FaUser, FaCarCrash,
  FaThList, FaSearch
} from 'react-icons/fa';
import { LuFileSearch2 } from "react-icons/lu";
import logo from '../assets/logo-corasur.png';
import "../App.css";

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const { token, user, logout } = useAuth();

  const [openAdmin, setOpenAdmin] = useState(true);
  const [openRRHH, setOpenRRHH] = useState(true);
  const [openSistemas, setOpenSistemas] = useState(true);
  const [openInventariado, setOpenInventariado] = useState(true);
  const [openTickets, setOpenTickets] = useState(true);
  const [openTaller, setOpenTaller] = useState(true);
  const [empleadoData, setEmpleadoData] = useState(null);

  const handleLinkClick = () => {
    if (closeSidebar) closeSidebar();
  };

  const rol = user?.user?.rol;
  const empleadoId = user?.user?.empleado_id;

  useEffect(() => {
    const fetchEmpleadoData = async () => {
      setEmpleadoData(null);

      if (!empleadoId || !token) {
        return;
      }

      try {
        const response = await axiosBackend.get('/empleados');
        const empleados = response.data;

        const empleado = empleados.find(emp =>
          emp.ID === empleadoId ||
          emp.id === empleadoId ||
          emp.empleado_id === empleadoId
        );

        setEmpleadoData(empleado);
      } catch (error) {
        console.error('Error al obtener datos del empleado en sidebar:', error);
        setEmpleadoData(null);
      }
    };

    fetchEmpleadoData();
  }, [empleadoId, token, user]);

  const getUserDisplayInfo = () => {
    if (!user) return { name: 'Usuario', identifier: '' };

    let displayName = 'Usuario';
    let identifier = '';

    if (empleadoData) {
      if (empleadoData.APELLIDOS_NOMBRES) {
        displayName = empleadoData.APELLIDOS_NOMBRES;
      } else if (empleadoData.NOMBRES && empleadoData.APELLIDOS) {
        displayName = `${empleadoData.NOMBRES} ${empleadoData.APELLIDOS}`;
      } else if (empleadoData.NOMBRES) {
        displayName = empleadoData.NOMBRES;
      }
    }

    const userData = user.user || user;
    if (userData.username) {
      identifier = userData.username;
    } else if (userData.email) {
      identifier = userData.email;
    } else if (userData.usuario) {
      identifier = userData.usuario;
    }

    return { name: displayName, identifier };
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen && <img src={logo} alt="Corasur Logo" className="sidebar-logo" />}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? '‹' : '›'}
        </button>
      </div>

      {token && isOpen && (
        <div className="sidebar-user-profile">
          <div className="user-info">
            <FaUser className="user-icon" />
            <div className="user-details">
              <div className="user-name">{getUserDisplayInfo().name}</div>
              <div className="user-identifier">{getUserDisplayInfo().identifier}</div>
              <div className="user-role">{rol}</div>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-content">
        <nav className="sidebar-links">
          <NavLink to="/home" className="nav-link" onClick={handleLinkClick}>
            <FaHome className="nav-icon" />
            {isOpen && "Home"}
          </NavLink>

          {token && (
            <>
              <NavLink to="/dashboard" className="nav-link" onClick={handleLinkClick}>
                <FaTachometerAlt className="nav-icon" />
                {isOpen && "Dashboard"}
              </NavLink>

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

              {(rol === "admin" || rol === "sistemas" || rol === "tecnico sistemas" || rol === "servicio taller") && (
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
                              <NavLink to="/equipos-admin" className="nav-link" onClick={handleLinkClick}>
                                <FaLaptop className="nav-icon" />
                                {isOpen && "Equipos Admin"}
                              </NavLink>
                              <NavLink to="/asignaciones" className="nav-link" onClick={handleLinkClick}>
                                <FaClipboardList className="nav-icon" />
                                {isOpen && "Asignaciones"}
                              </NavLink>
                            </div>
                          )}
                          {(rol === "admin" || rol === "tecnico sistemas" || rol === "servicio taller" || rol === "rrhh" || rol === "sistemas") && openInventariado && (
                                <div className="sidebar-group-items">
                                  <NavLink to="/equipos" className="nav-link" onClick={handleLinkClick}>
                                    <FaLaptop className="nav-icon" />
                                    {isOpen && "Equipos"}
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
                      {(rol === "admin" || rol === "tecnico sistemas" || rol === "servicio taller" || rol === "rrhh" || rol === "sistemas") && (
                        <div className="sidebar-group">
                          <div className="sidebar-group-title" onClick={() => setOpenTickets(!openTickets)}>
                            {openTickets ? <FaChevronDown /> : <FaChevronRight />}
                            <FaTicketAlt className="nav-icon" />
                            {isOpen && "Tickets"}
                          </div>
                          {openTickets && (
                            <div className="sidebar-group-items">
                              <NavLink to="/crear-ticket-publico" className="nav-link" onClick={handleLinkClick}>
                                <FaTicketAlt className="nav-icon" />
                                {isOpen && "Crear Ticket"}
                              </NavLink>
                              <NavLink to="/estado-ticket-publico" className="nav-link" onClick={handleLinkClick}>
                                <FaTicketAlt className="nav-icon" />
                                {isOpen && "Estado Ticket"}
                              </NavLink>
                              <NavLink to="/buscar-soluciones-tickets" className="nav-link" onClick={handleLinkClick}>
                                <FaTicketAlt className="nav-icon" />
                                {isOpen && "Soluciones Tickets"}
                              </NavLink>
                            </div>
                          )}
                          {(rol === "admin" || rol === "tecnico sistemas" || rol === "sistemas") && openTickets && (
                            <div className="sidebar-group-items">
                              <NavLink to="/tickets-gestion" className="nav-link" onClick={handleLinkClick}>
                                <FaTicketAlt className="nav-icon" />
                                {isOpen && "Gestión de Tickets"}
                              </NavLink>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}

              {(rol === "admin" || rol === "servicio taller") && (
                <div className="sidebar-group">
                  <div className="sidebar-group-title" onClick={() => setOpenTaller(!openTaller)}>
                    {openTaller ? <FaChevronDown /> : <FaChevronRight />}
                    <FaCarCrash className="nav-icon" />
                    {isOpen && "Taller"}
                  </div>
                  {openTaller && (
                    <div className="sidebar-group-items">
                      <NavLink to="/tarifario" className="nav-link" onClick={handleLinkClick}>
                        <FaThList className="nav-icon" />
                        {isOpen && "Tarifario"}
                      </NavLink>
                      <NavLink to="/buscar-info" className="nav-link" onClick={handleLinkClick}>
                        <LuFileSearch2 className="nav-icon" />
                        {isOpen && "Buscar Info"}
                      </NavLink>
                      <NavLink to="/buscar-sap" className="nav-link" onClick={handleLinkClick}>
                        <FaSearch className="nav-icon" />
                        {isOpen && "Buscar SAP"}
                      </NavLink>
                    </div>
                  )}
                </div>)}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          {token && (
            <button onClick={logout} className="nav-link btn-logout">
              <FaSignOutAlt className="nav-icon" />
              {isOpen && "Cerrar Sesión"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
