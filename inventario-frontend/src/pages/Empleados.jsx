import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { FaEye, FaPencilAlt } from "react-icons/fa";

const CAMPOS_MODAL = [
  "ID", "CUC", "DNI", "APELLIDOS_NOMBRES", "HIJOS", "ESTADO CIVIL", "FECHA DE INGRESO", "SEDE", "AREA", "PUESTO",
  "ASIGNACION FAMILIAR", "SEXO", "SISTEMAS DE PENSIONES", "TIPO DE AFP", "NUMERO DE CUSSP", "FECHA DE NACIMIENTO",
  "EDAD", "DIRECCION", "TELEFONO PERSONAL", "TELEFONO COORPORATIVO", "BANCO DE ABONO HABERES", "CUENTA BANCARIA HABERES",
  "MONEDA DE CTA HABERES", "TIPO DE PLANILLA", "REGIMEN VACACIONAL", "CORREO ELECTRONICO INSTITUCIONAL",
  "CORREO ELECTRONICO PERSONAL", "TIPO DE CONTRATO", "FECHA INICIO DE CONTRATO", "FECHA FIN DE CONTRATO",
  "TIEMPO DE SERVICIO", "PERIODO DE PRUEBA", "PERIODO DE CONTRATO", "RENOVACIÓN", "GRADO DE ESTUDIOS",
  "CENTRO DE ESTUDIOS", "AÑO DE EGRESO", "CONTACTO DE REFERENCIA", "TALLA"
];

const MAPEO_CAMPOS = {
  "ASIGNACION FAMILIAR": "asignacion_familiar",
  "RENOVACIÓN": "renovacion",
};

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
                <td>
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

      {/* Modal de detalle */}
      {modalEmpleadoVisible && empleadoVisualizar && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <button className="modal-close-button" onClick={() => setModalEmpleadoVisible(false)}>&times;</button>
            <h3>Detalle del Empleado</h3>
            <table className="equipo-modal-table">
              <tbody>
                {CAMPOS_MODAL.map((campo) => (
                  <tr key={campo}>
                    <td style={{ fontWeight: 600 }}>{campo}:</td>
                    <td>
                      {(() => {
                        const key = MAPEO_CAMPOS[campo] || campo;
                        let valor = empleadoVisualizar[key];
                        if (key === "asignacion_familiar" || key === "renovacion") {
                          if (valor === true) return "Sí";
                          if (valor === false) return "No";
                          return "—";
                        }
                        return valor ?? "—";
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button onClick={() => setModalEmpleadoVisible(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
