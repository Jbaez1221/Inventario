import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';
import { 
  FaDesktop, 
  FaUsers, 
  FaTicketAlt, 
  FaCog, 
  FaClipboardList,
  FaUserPlus,
  FaSearch,
  FaHistory,
  FaUserShield,
  FaCheck
} from 'react-icons/fa';

const Home = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    equiposLibres: 0,
    totalEmpleados: 0,
    ticketsPendientes: 0,
    ticketsAsignadosTotal: 0,
    ticketsEnProcesoEspera: 0,
    equiposTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [empleadoData, setEmpleadoData] = useState(null);

  const rol = user?.user?.rol;
  const empleadoId = user?.user?.empleado_id;

  useEffect(() => {
    const fetchEmpleadoData = async () => {
      setEmpleadoData(null);
      
      if (!empleadoId || !token) {
        console.log('No hay empleadoId o token, reseteando empleadoData');
        return;
      }
      
      try {
        console.log('Buscando empleado con ID:', empleadoId);
        
        const response = await axios.get('/empleados');
        const empleados = response.data;
        
        const empleado = empleados.find(emp => 
          emp.ID === empleadoId || 
          emp.id === empleadoId ||
          emp.empleado_id === empleadoId
        );
        
        console.log('Empleado encontrado:', empleado);
        setEmpleadoData(empleado);
      } catch (error) {
        console.error('Error al obtener datos del empleado:', error);
        setEmpleadoData(null);
      }
    };

    fetchEmpleadoData();
  }, [empleadoId, token, user]);
  
  const getUserName = () => {
    if (!user) return 'Usuario';
    
    if (empleadoId && !empleadoData) {
      return 'Cargando...';
    }
    
    if (empleadoData) {
      if (empleadoData.APELLIDOS_NOMBRES) return empleadoData.APELLIDOS_NOMBRES;
      if (empleadoData.NOMBRES && empleadoData.APELLIDOS) {
        return `${empleadoData.NOMBRES} ${empleadoData.APELLIDOS}`;
      }
      if (empleadoData.NOMBRES) return empleadoData.NOMBRES;
    }
    
    console.log('=== USUARIO COMPLETO ===');
    console.log('user:', user);
    console.log('user.user:', user.user);
    console.log('empleadoData:', empleadoData);
    console.log('empleadoId:', empleadoId);
    console.log('======================');
    
    const userData = user.user || user;
    
    const allProperties = [
      'APELLIDOS_NOMBRES', 'apellidos_nombres', 'nombre_completo', 'NOMBRE_COMPLETO',
      'NOMBRES', 'nombres', 'nombre', 'NOMBRE', 'name', 'fullName',
      'APELLIDOS', 'apellidos', 'apellido', 'APELLIDO', 'lastName',
      'username', 'usuario', 'user', 'login',
      'email', 'correo', 'mail'
    ];
    
    console.log('Propiedades disponibles:', allProperties.filter(prop => userData[prop]));
    
    if (userData.APELLIDOS_NOMBRES) return userData.APELLIDOS_NOMBRES;
    if (userData.NOMBRES && userData.APELLIDOS) return `${userData.NOMBRES} ${userData.APELLIDOS}`;
    if (userData.nombres && userData.apellidos) return `${userData.nombres} ${userData.apellidos}`;
    if (userData.NOMBRES) return userData.NOMBRES;
    if (userData.nombres) return userData.nombres;
    if (userData.nombre) return userData.nombre;
    if (userData.username) return userData.username;
    if (userData.usuario) return userData.usuario;
    
    return 'Usuario';
  };

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      
      const [equiposRes, empleadosRes] = await Promise.all([
        axios.get('/equipos'),
        axios.get('/empleados')
      ]);
      
      const equiposLibres = equiposRes.data.filter(e => e.estado === 'Disponible').length;
      
      setStats({
        equiposLibres,
        totalEmpleados: empleadosRes.data.length,
        equiposTotal: equiposRes.data.length
      });

      // Cargar tickets asignados para técnico sistemas
      if (token && rol === 'tecnico sistemas' && user?.user?.empleado_id) {
        try {
          // Usar el endpoint correcto para obtener todos los tickets y filtrar por asignado
          const ticketsRes = await axios.get('/tickets');
          const todosTickets = ticketsRes.data || [];
          
          // Filtrar tickets asignados al técnico actual
          const ticketsAsignadosData = todosTickets.filter(t => 
            t.personal_asignado_id === user.user.empleado_id
          );
          
          // Filtrar tickets pendientes (no cerrados) para el técnico
          const ticketsPendientesTecnico = ticketsAsignadosData.filter(t => 
            t.estado !== 'Cerrado'
          );
          
          // Total de tickets asignados (todos los estados)
          const totalAsignados = ticketsAsignadosData.length;
          
          // Contar tickets en proceso/espera
          const ticketsEnProcesoEspera = ticketsAsignadosData.filter(t => 
            t.estado === 'En proceso' || t.estado === 'En espera'
          ).length;
          
          // Actualizar estadísticas con tickets pendientes del técnico
          setStats(prev => ({ 
            ...prev, 
            ticketsPendientes: ticketsPendientesTecnico.length,
            ticketsAsignadosTotal: totalAsignados,
            ticketsEnProcesoEspera: ticketsEnProcesoEspera
          }));
        } catch (error) {
          console.error('Error cargando tickets:', error);
        }
      }

      if (token && rol === 'admin') {
        try {
          const ticketsRes = await axios.get('/tickets');
          const pendientes = ticketsRes.data.filter(t => 
            t.estado === 'En espera' || t.estado === 'En proceso'
          ).length;
          setStats(prev => ({ ...prev, ticketsPendientes: pendientes }));
        } catch (error) {
          console.error('Error cargando tickets pendientes:', error);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [token, rol, user?.user?.empleado_id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const CardStat = ({ icon: IconComponent, title, value, color, onClick }) => (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
      style={{ '--accent-color': color }}
    >
      <div className="stat-icon">
        {IconComponent && <IconComponent />}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: IconComponent, title, description, color, onClick }) => (
    <div className="quick-action-card" onClick={onClick}>
      <div className="action-icon" style={{ color }}>
        {IconComponent && <IconComponent />}
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-state">
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>
          {!token ? 'Bienvenido al Sistema de CORASUR' : 
           `Bienvenido, ${getUserName()}`}
        </h1>
        <p className="home-subtitle">
          {!token ? 'Sistema de gestión de inventario y tickets de incidencias' :
           rol === 'tecnico sistemas' ? 'Panel de técnico - Gestiona tus tickets asignados' :
           rol === 'rrhh' ? 'Panel de Recursos Humanos - Gestión de personal' :
           rol === 'sistemas' ? 'Panel de Sistemas - Administración de inventario y tickets' :
           'Panel de administración - Control del sistema'}
        </p>
      </div>

      {!token && (
        <>
          <div className="stats-grid">
            <CardStat
              icon={FaDesktop}
              title="Equipos Disponibles"
              value={stats.equiposLibres}
              color="var(--accent-success)"
              onClick={() => navigate('/equipos')}
            />
            <CardStat
              icon={FaUsers}
              title="Total Empleados"
              value={stats.totalEmpleados}
              color="var(--accent-info)"
            />
            <CardStat
              icon={FaDesktop}
              title="Total Equipos"
              value={stats.equiposTotal}
              color="var(--accent-primary)"
            />
          </div>

          <div className="quick-actions">
            <h2>Acciones Rápidas</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={FaTicketAlt}
                title="Crear Ticket"
                description="Reporta una incidencia o solicitud"
                color="var(--accent-primary)"
                onClick={() => navigate('/crear-ticket-publico')}
              />
              <QuickActionCard
                icon={FaSearch}
                title="Consultar Estado"
                description="Consulta el estado de tu ticket"
                color="var(--accent-info)"
                onClick={() => navigate('/estado-ticket-publico')}
              />
              <QuickActionCard
                icon={FaDesktop}
                title="Ver Equipos"
                description="Consulta el inventario de equipos"
                color="var(--accent-success)"
                onClick={() => navigate('/equipos')}
              />
            </div>
          </div>
        </>
      )}

      {token && rol === 'tecnico sistemas' && (
        <>
          <div className="stats-grid">
            <CardStat
              icon={FaTicketAlt}
              title="Tickets Pendientes"
              value={stats.ticketsPendientes}
              color={stats.ticketsPendientes > 0 ? "var(--accent-warning)" : "var(--accent-success)"}
              onClick={() => navigate('/tickets-gestion')}
            />
            <CardStat
              icon={FaClipboardList}
              title="Total Asignados"
              value={stats.ticketsAsignadosTotal || 0}
              color="var(--accent-info)"
              onClick={() => navigate('/tickets-gestion')}
            />
            <CardStat
              icon={FaCheck}
              title="En Proceso/Espera"
              value={stats.ticketsEnProcesoEspera || 0}
              color="var(--accent-primary)"
              onClick={() => navigate('/tickets-gestion')}
            />
          </div>

          <div className="quick-actions">
            <h2>Gestión de Tickets</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={FaTicketAlt}
                title="Gestionar Tickets"
                description="Ver y gestionar tickets asignados"
                color="var(--accent-primary)"
                onClick={() => navigate('/tickets-gestion')}
              />
              <QuickActionCard
                icon={FaSearch}
                title="Buscar Soluciones"
                description="Buscar soluciones a tickets"
                color="var(--accent-info)"
                onClick={() => navigate('/buscar-soluciones-tickets')}
              />
            </div>
          </div>
        </>
      )}

      {token && rol === 'rrhh' && (
        <>
          <div className="stats-grid">
            <CardStat
              icon={FaUsers}
              title="Total Empleados"
              value={stats.totalEmpleados}
              color="var(--accent-primary)"
              onClick={() => navigate('/empleados')}
            />
          </div>

          <div className="quick-actions">
            <h2>Gestión de Personal</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={FaUserPlus}
                title="Gestionar Empleados"
                description="Agregar, editar y administrar empleados"
                color="var(--accent-primary)"
                onClick={() => navigate('/empleados')}
              />
            </div>
          </div>
        </>
      )}

      {token && rol === 'sistemas' && (
        <>
          <div className="stats-grid">
            <CardStat
              icon={FaDesktop}
              title="Equipos Disponibles"
              value={stats.equiposLibres}
              color="var(--accent-success)"
              onClick={() => navigate('/equipos')}
            />
            <CardStat
              icon={FaDesktop}
              title="Total Equipos"
              value={stats.equiposTotal}
              color="var(--accent-info)"
              onClick={() => navigate('/equipos-admin')}
            />
            <CardStat
              icon={FaTicketAlt}
              title="Tickets Pendientes"
              value={stats.ticketsPendientes}
              color="var(--accent-warning)"
              onClick={() => navigate('/solicitudes')}
            />
            <CardStat
              icon={FaClipboardList}
              title="Asignaciones"
              value="Gestionar"
              color="var(--accent-primary)"
              onClick={() => navigate('/asignaciones')}
            />
          </div>

          <div className="quick-actions">
            <h2>Administración de Sistemas</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={FaDesktop}
                title="Administrar Equipos"
                description="Gestionar inventario completo"
                color="var(--accent-success)"
                onClick={() => navigate('/equipos-admin')}
              />
              <QuickActionCard
                icon={FaClipboardList}
                title="Gestionar Asignaciones"
                description="Asignar equipos a empleados"
                color="var(--accent-primary)"
                onClick={() => navigate('/asignaciones')}
              />
              <QuickActionCard
                icon={FaTicketAlt}
                title="Asignar Tickets"
                description="Asignar tickets a técnicos"
                color="var(--accent-warning)"
                onClick={() => navigate('/solicitudes')}
              />
              <QuickActionCard
                icon={FaHistory}
                title="Historial de Equipos"
                description="Ver historial de cambios"
                color="var(--accent-info)"
                onClick={() => navigate('/historial')}
              />
            </div>
          </div>
        </>
      )}

      {token && rol === 'admin' && (
        <>
          <div className="stats-grid">
            <CardStat
              icon={FaUsers}
              title="Total Empleados"
              value={stats.totalEmpleados}
              color="var(--accent-primary)"
              onClick={() => navigate('/empleados')}
            />
            <CardStat
              icon={FaDesktop}
              title="Equipos Disponibles"
              value={stats.equiposLibres}
              color="var(--accent-success)"
              onClick={() => navigate('/equipos')}
            />
            <CardStat
              icon={FaTicketAlt}
              title="Tickets Pendientes"
              value={stats.ticketsPendientes}
              color="var(--accent-warning)"
              onClick={() => navigate('/solicitudes')}
            />
            <CardStat
              icon={FaDesktop}
              title="Total Equipos"
              value={stats.equiposTotal}
              color="var(--accent-info)"
              onClick={() => navigate('/equipos-admin')}
            />
          </div>

          <div className="quick-actions">
            <h2>Administración Completa</h2>
            <div className="actions-grid">
              <QuickActionCard
                icon={FaUserPlus}
                title="Gestionar Empleados"
                description="Administrar personal de la empresa"
                color="var(--accent-primary)"
                onClick={() => navigate('/empleados')}
              />
              <QuickActionCard
                icon={FaDesktop}
                title="Administrar Equipos"
                description="Gestionar inventario completo"
                color="var(--accent-success)"
                onClick={() => navigate('/equipos-admin')}
              />
              <QuickActionCard
                icon={FaTicketAlt}
                title="Gestionar Solicitudes"
                description="Ver y asignar tickets"
                color="var(--accent-warning)"
                onClick={() => navigate('/solicitudes')}
              />
              <QuickActionCard
                icon={FaCog}
                title="Configuración"
                description="Usuarios y roles del sistema"
                color="var(--accent-info)"
                onClick={() => navigate('/usuarios')}
              />
              <QuickActionCard
                icon={FaClipboardList}
                title="Asignaciones"
                description="Gestionar asignaciones de equipos"
                color="var(--accent-primary)"
                onClick={() => navigate('/asignaciones')}
              />
              <QuickActionCard
                icon={FaUserShield}
                title="Roles"
                description="Administrar roles del sistema"
                color="var(--accent-secondary)"
                onClick={() => navigate('/roles')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
