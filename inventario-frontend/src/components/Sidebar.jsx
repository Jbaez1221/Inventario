import { useState, useEffect, use } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axiosBackend from '../api/axios';
import {
  FaLaptop, FaUsers, FaClipboardList, FaHistory, FaTachometerAlt, FaSignOutAlt, FaFileAlt, FaUserShield, FaChevronDown, FaChevronRight,
  FaUserCog, FaBuilding, FaCogs, FaTicketAlt, FaLayerGroup, FaHome, FaUser, FaCarCrash,
  FaThList, FaSearch
} from 'react-icons/fa';
import { LuFileSearch2 } from "react-icons/lu";
import { MdContentPasteSearch, MdOutlinePriceChange } from "react-icons/md";
import logo from '../assets/logo-corasur.png';
import "../App.css";

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const { token, user, logout } = useAuth();
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openRRHH, setOpenRRHH] = useState(false);
  const [openSistemas, setOpenSistemas] = useState(false);
  const [openInventariado, setOpenInventariado] = useState(false);
  const [openTickets, setOpenTickets] = useState(false);
  const [openTaller, setOpenTaller] = useState(false);
  const [openAsesor, setOpenAsesor] = useState(false);
  const [openBuscar, setOpenBuscar] = useState(false);
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
              {(rol === "admin" || rol === "jefe taller") && (
                <NavLink to="/dashboard-taller" className="nav-link" onClick={handleLinkClick}>
                  <FaTachometerAlt className="nav-icon" />
                  {isOpen && "Dashboard Taller"}
                </NavLink>
              )}
              {(rol === "admin" || rol === "jefe rrhh") && (
                <NavLink to="/dashboard-rrhh" className="nav-link" onClick={handleLinkClick}>
                  <FaTachometerAlt className="nav-icon" />
                  {isOpen && "Dashboard RRHH"}
                </NavLink>
              )}
              {(rol === "admin" || rol === "jefe sistemas") && (
                <NavLink to="/dashboard-sistemas" className="nav-link" onClick={handleLinkClick}>
                  <FaTachometerAlt className="nav-icon" />
                  {isOpen && "Dashboard Sistemas"}
                </NavLink>
              )}
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

              {(rol === "admin" || rol === "rrhh" || rol === "asistente rrhh") && (
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

              {(rol === "admin" || rol === "sistemas" || rol === "tecnico sistemas" || rol === "servicio taller" || rol === "jefe sistemas" || rol === "jefe taller" || rol === "jefe rrhh" || rol === "tecnico taller" || rol === "asesor servicio" || rol === "asistente rrhh" || rol === "empleado") && (
                <div className="sidebar-group">
                  <div className="sidebar-group-title" onClick={() => setOpenSistemas(!openSistemas)}>
                    {openSistemas ? <FaChevronDown /> : <FaChevronRight />}
                    <FaCogs className="nav-icon" />
                    {isOpen && "Sistemas"}
                  </div>
                  {openSistemas && (
                    <div className="sidebar-group-items">
                      {(rol === "admin" || rol === "jefe sistemas") && (
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

                            </div>
                          )}
                          {(rol === "admin" || rol === "tecnico sistemas" || rol === "jefe sistemas") && openInventariado && (
                            <div className="sidebar-group-items">
                              <NavLink to="/asignaciones" className="nav-link" onClick={handleLinkClick}>
                                <FaClipboardList className="nav-icon" />
                                {isOpen && "Asignaciones"}
                              </NavLink>
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
                      {(rol === "admin" || rol === "jefe taller" || rol === "jefe rrhh" || rol === "tecnico taller" || rol === "tecnico sistemas" || rol === "asesor servicio" || rol === "asistente rrhh" || rol === "empleado" || rol === "jefe sistemas") && (
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
                          {(rol === "admin" || rol === "jefe sistemas") && openTickets && (
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

              {(rol === "admin" || rol === "jefe taller" || rol === "tecnico taller" || rol === "asesor servicio") && (
                <div className="sidebar-group">
                  <div className="sidebar-group-title" onClick={() => setOpenTaller(!openTaller)}>
                    {openTaller ? <FaChevronDown /> : <FaChevronRight />}
                    <FaCarCrash className="nav-icon" />
                    {isOpen && "Taller"}
                  </div>
                  {openTaller && (
                    <div className="sidebar-group-items">
                      <div className="sidebar-group">
                        <div className="sidebar-group-title" onClick={() => setOpenAsesor(!openAsesor)}>
                          {openAsesor ? <FaChevronDown /> : <FaChevronRight />}
                          <MdOutlinePriceChange className="nav-icon" />
                          {isOpen && "Precios"}
                        </div>
                        {openAsesor && (
                          <div className="sidebar-group-items">
                            <NavLink to="/tarifario" className="nav-link" onClick={handleLinkClick}>
                              <FaThList className="nav-icon" /> {isOpen && "Tarifario"}
                            </NavLink>
                          </div>
                        )}
                      </div>
                      <div className="sidebar-group">
                        <div className="sidebar-group-title" onClick={() => setOpenBuscar(!openBuscar)}>
                          {openBuscar ? <FaChevronDown /> : <FaChevronRight />}
                          <MdContentPasteSearch className="nav-icon" />
                          {isOpen && "Buscar"}
                        </div>
                        {openBuscar && (
                          <div className="sidebar-group-items">
                            <NavLink to="/buscar-info" className="nav-link" onClick={handleLinkClick}>
                              <LuFileSearch2 className="nav-icon" /> {isOpen && "Buscar Historial"}
                            </NavLink>
                            <NavLink to="/buscar-sap" className="nav-link" onClick={handleLinkClick}>
                              <FaSearch className="nav-icon" /> {isOpen && "Buscar SAP"}
                            </NavLink>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
