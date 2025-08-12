import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaEye, FaPencilAlt } from "react-icons/fa";

const SECCIONES_MODAL = [
  {
    titulo: "Datos Personales",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke="#8ab4f8" strokeWidth="2"/>
        <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#8ab4f8" strokeWidth="2"/>
      </svg>
    ),
    campos: [
      { label: "ID", key: "ID" },
      { label: "CUC", key: "CUC" },
      { label: "DNI", key: "DNI" },
      { label: "Apellidos", key: "APELLIDOS" },
      { label: "Nombres", key: "NOMBRES" },
      { label: "Hijos", key: "HIJOS" },
      { label: "Estado Civil", key: "ESTADO CIVIL" },
      { label: "Fecha de Nacimiento", key: "FECHA DE NACIMIENTO", tipo: "fecha" },
      { label: "Edad", key: "EDAD" },
      { label: "Sexo", key: "SEXO" },
      { label: "Dirección", key: "DIRECCION" },
      { label: "Talla", key: "TALLA" }
    ]
  },
  {
    titulo: "Datos de Contrato",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#8ab4f8" strokeWidth="2"/>
        <path d="M8 7h8M8 11h8M8 15h4" stroke="#8ab4f8" strokeWidth="2"/>
      </svg>
    ),
    campos: [
      { label: "Fecha de Ingreso", key: "FECHA DE INGRESO", tipo: "fecha" },
      { label: "Sede", key: "SEDE" },
      { label: "Área", key: "AREA" },
      { label: "Puesto", key: "PUESTO" },
      { label: "Tipo de Contrato", key: "TIPO DE CONTRATO" },
      { label: "Fecha Inicio Contrato", key: "FECHA INICIO DE CONTRATO", tipo: "fecha" },
      { label: "Fecha Fin Contrato", key: "FECHA FIN DE CONTRATO", tipo: "fecha" },
      { label: "Periodo de Prueba", key: "PERIODO DE PRUEBA" },
      { label: "Periodo de Contrato", key: "PERIODO DE CONTRATO" },
      { label: "Renovación", key: "RENOVACIÓN" },
      { label: "Régimen Vacacional", key: "REGIMEN VACACIONAL" },
      { label: "Tipo de Planilla", key: "TIPO DE PLANILLA" },
      { label: "Tiempo de Servicio", key: "TIEMPO DE SERVICIO" }
    ]
  },
  {
    titulo: "Datos Bancarios",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="#8ab4f8" strokeWidth="2"/>
        <path d="M3 10h18" stroke="#8ab4f8" strokeWidth="2"/>
      </svg>
    ),
    campos: [
      { label: "Banco de Abono Haberes", key: "BANCO DE ABONO HABERES" },
      { label: "Cuenta Bancaria Haberes", key: "CUENTA BANCARIA HABERES" },
      { label: "Moneda de Cuenta Haberes", key: "MONEDA DE CTA HABERES" }
    ]
  },
  {
    titulo: "Sistemas de Pensiones",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="10" width="16" height="8" rx="2" stroke="#8ab4f8" strokeWidth="2"/>
        <path d="M2 10l10-6 10 6" stroke="#8ab4f8" strokeWidth="2"/>
      </svg>
    ),
    campos: [
      { label: "Sistemas de Pensiones", key: "SISTEMAS DE PENSIONES" },
      { label: "Tipo de AFP", key: "TIPO DE AFP" },
      { label: "Número de CUSSP", key: "NUMERO DE CUSSP" },
      { label: "Asignación Familiar", key: "asignacion_familiar", tipo: "boolean" }
    ]
  },
  {
    titulo: "Contacto y Estudios",
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M6 8v2a6 6 0 006 6h2" stroke="#8ab4f8" strokeWidth="2"/>
        <rect x="14" y="14" width="6" height="6" rx="1" stroke="#8ab4f8" strokeWidth="2"/>
        <circle cx="8" cy="6" r="2" stroke="#8ab4f8" strokeWidth="2"/>
      </svg>
    ),
    campos: [
      { label: "Teléfono Personal", key: "TELEFONO PERSONAL" },
      { label: "Teléfono Corporativo", key: "TELEFONO COORPORATIVO" },
      { label: "Correo Institucional", key: "CORREO ELECTRONICO INSTITUCIONAL" },
      { label: "Correo Personal", key: "CORREO ELECTRONICO PERSONAL" },
      { label: "Grado de Estudios", key: "GRADO DE ESTUDIOS" },
      { label: "Centro de Estudios", key: "CENTRO DE ESTUDIOS" },
      { label: "Año de Egreso", key: "AÑO DE EGRESO" },
      { label: "Contacto de Referencia", key: "CONTACTO DE REFERENCIA" }
    ]
  }
];

const Empleados = () => {
  const { token, user } = useAuth();
  const rol = user?.user?.rol;
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [empleadoVisualizar, setEmpleadoVisualizar] = useState(null);
  const [modalEmpleadoVisible, setModalEmpleadoVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const obtenerEmpleados = async () => {
    try {
      const res = await axiosBackend.get("/empleados");
      setEmpleados(res.data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
    }
  };

  const empleadosFiltrados = empleados.filter((empleado) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    if (!busquedaLower) return true;
    return Object.values(empleado).some(val =>
      val && String(val).toLowerCase().includes(busquedaLower)
    );
  });

  const totalPages = Math.ceil(empleadosFiltrados.length / itemsPerPage);
  const paginatedEmpleados = empleadosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const formatearValor = (valor, tipo) => {
    if (valor === null || valor === undefined || valor === "") return "—";
    
    switch (tipo) {
      case "boolean":
        return valor === true ? "Sí" : valor === false ? "No" : "—";
      case "fecha":
        if (!valor) return "—";
        try {
          return new Date(valor).toLocaleDateString('es-ES');
        } catch {
          return valor;
        }
      default:
        return valor;
    }
  };

  return (
    <div>
      <h2>Empleados</h2>

      {token && (rol === "admin" || rol === "rrhh") && (
        <button className="btn-primary" onClick={() => navigate("/empleados/gestionar")}>
          Agregar empleado
        </button>
      )}

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, área, etc..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={() => setBusqueda("")} className="btn-secondary">Limpiar</button>
      </div>

      <div className="tabla-container">
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>ID</th>
              <th>DNI</th>
              <th>Apellidos y Nombres</th>
              <th>Área</th>
              <th>Puesto</th>
              <th>Sede</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmpleados.map((empleado) => (
              <tr key={empleado.id || empleado.DNI}>
                <td>{empleado.ID || empleado.id}</td>
                <td>{empleado.DNI}</td>
                <td>{empleado.APELLIDOS_NOMBRES}</td>
                <td>{empleado.AREA}</td>
                <td>{empleado.PUESTO}</td>
                <td>{empleado.SEDE}</td>
                <td className="acciones">
                  <button className="btn-info btn-icon" onClick={() => { setEmpleadoVisualizar(empleado); setModalEmpleadoVisible(true); }} title="Ver detalle">
                    <FaEye />
                  </button>
                  {token && (rol === "admin" || rol === "rrhh") && (
                    <button
                      className="btn-primary btn-icon"
                      onClick={() => navigate(`/empleados/gestionar/${empleado.DNI}`)}
                      title="Editar"
                    >
                      <FaPencilAlt />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span style={{ margin: "0 12px" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {modalEmpleadoVisible && empleadoVisualizar && (
        <div className="modal-overlay">
          <div className="modal-content empleado-modal">
            <button className="modal-close-button" onClick={() => setModalEmpleadoVisible(false)}>&times;</button>
            
            <h2 className="empleado-modal-title">Detalle del Empleado</h2>
            <div className="empleado-modal-subtitle">
              {empleadoVisualizar.APELLIDOS_NOMBRES || `${empleadoVisualizar.APELLIDOS} ${empleadoVisualizar.NOMBRES}`}
            </div>

            <div className="empleado-modal-content">
              {SECCIONES_MODAL.map((seccion, index) => (
                <div key={index} className="empleado-modal-section">
                  <div className="empleado-section-header">
                    <span className="empleado-section-icon">{seccion.icon}</span>
                    <span className="empleado-section-title">{seccion.titulo}</span>
                  </div>
                  
                  <div className="empleado-section-grid">
                    {seccion.campos.map((campo) => (
                      <div key={campo.key} className="empleado-field">
                        <div className="empleado-field-label">{campo.label}:</div>
                        <div className="empleado-field-value">
                          {formatearValor(empleadoVisualizar[campo.key], campo.tipo)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalEmpleadoVisible(false)}>
                Cerrar
              </button>
              {token && (rol === "admin" || rol === "rrhh") && (
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setModalEmpleadoVisible(false);
                    navigate(`/empleados/gestionar/${empleadoVisualizar.DNI}`);
                  }}
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
