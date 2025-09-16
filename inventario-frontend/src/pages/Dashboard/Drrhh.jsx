import { useEffect, useState } from "react";
import axiosBackend from "../../api/axios";
import {
  FaLaptop,
  FaCheckCircle,
  FaUserTie,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaUndo,
} from "react-icons/fa";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale, 
  BarElement,
  Title,
} from "chart.js";
import "../../App.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Drrhh = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalEquipos: 0,
    disponibles: 0,
    asignados: 0,
    empleados: 0,
    asignacionesActivas: 0,
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0,
    totalDevoluciones: 0,
    actasGeneradas: 0,
  });

  const [asignacionesPorMes, setAsignacionesPorMes] = useState([]);
  const [solicitudesPorMes, setSolicitudesPorMes] = useState([]);
  const [solicitudesPorEstado, setSolicitudesPorEstado] = useState({});
  const [equiposPorSede, setEquiposPorSede] = useState({});
  const [equiposPorTipo, setEquiposPorTipo] = useState({});
  const [equiposPorArea, setEquiposPorArea] = useState({});
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    cargarEstadisticas();
  }, [fechaInicio, fechaFin]);

  const contarPorCampo = (lista, campo) => {
    const conteo = {};
    lista.forEach((item) => {
      const clave = item[campo] || "Sin especificar";
      conteo[clave] = (conteo[clave] || 0) + 1;
    });
    return conteo;
  };

  const dentroDelRango = (fecha) => {
    if (!fechaInicio && !fechaFin) return true;
    const f = new Date(fecha);
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;
    if (inicio && f < inicio) return false;
    if (fin && f > fin) return false;
    return true;
  };

  const cargarEstadisticas = async () => {
    try {
      const [resEquipos, resEmpleados, resAsignaciones, resSolicitudes] =
        await Promise.all([
          axiosBackend.get("/equipos"),
          axiosBackend.get("/empleados"),
          axiosBackend.get("/asignaciones"),
          axiosBackend.get("/solicitudes"),
        ]);

      const equipos = resEquipos.data;
      const empleados = resEmpleados.data;
      const asignaciones = resAsignaciones.data;
      const solicitudes = resSolicitudes.data;

      const totalEquipos = equipos.length;
      const disponibles = equipos.filter((e) => e.estado === "Disponible").length;
      const asignados = totalEquipos - disponibles;
      const asignacionesActivas = asignaciones.filter((a) => !a.fecha_devolucion).length;
      const totalDevoluciones = asignaciones.filter((a) => a.fecha_devolucion).length;
      const actasGeneradas = asignaciones.filter((a) => a.acta_pdf).length;

      const totalSolicitudes = solicitudes.length;
      const solicitudesPendientes = solicitudes.filter((s) => s.estado === "Pendiente").length;
      const solicitudesAprobadas = solicitudes.filter((s) => s.estado === "Aprobada").length;
      const solicitudesRechazadas = solicitudes.filter((s) => s.estado === "Rechazada").length;

      const asignacionesMes = Array(12).fill(0);
      const solicitudesMes = Array(12).fill(0);
      const solicitudesEstado = contarPorCampo(solicitudes, "estado");

      asignaciones
        .filter((a) => dentroDelRango(a.fecha_entrega))
        .forEach((a) => {
          const mes = new Date(a.fecha_entrega).getMonth();
          asignacionesMes[mes]++;
        });

      solicitudes
        .filter((s) => dentroDelRango(s.fecha))
        .forEach((s) => {
          const mes = new Date(s.fecha).getMonth();
          solicitudesMes[mes]++;
        });

      setEstadisticas({
        totalEquipos,
        disponibles,
        asignados,
        empleados: empleados.length,
        asignacionesActivas,
        totalSolicitudes,
        solicitudesPendientes,
        solicitudesAprobadas,
        solicitudesRechazadas,
        totalDevoluciones,
        actasGeneradas,
      });

      setAsignacionesPorMes(asignacionesMes);
      setSolicitudesPorMes(solicitudesMes);
      setSolicitudesPorEstado(solicitudesEstado);
      setEquiposPorSede(contarPorCampo(equipos, "ubicacion"));
      setEquiposPorTipo(contarPorCampo(equipos, "tipo"));
      setEquiposPorArea(contarPorCampo(equipos, "area"));
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const opcionesGenerales = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
      y: {
        beginAtZero: true,
        ticks: { color: "#9ca3af" },
        grid: { color: "#374151" },
      },
    },
  };

  const ChartBox = ({ titulo, children }) => (
    <div className="chart-box">
      <h2 className="chart-title">{titulo}</h2>
      <div className="chart-container">{children}</div>
    </div>
  );

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Resumen de métricas globales.</p>
        </div>
        <div className="filtros-container dashboard-filtros">
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
      </div>

      <div className="tarjetas-grid">
        <Card titulo="Total Equipos" valor={estadisticas.totalEquipos} icon={<FaLaptop />} />
        <Card titulo="Disponibles" valor={estadisticas.disponibles} icon={<FaCheckCircle />} />
        <Card titulo="Asignados" valor={estadisticas.asignados} icon={<FaClipboardList />} />
        <Card titulo="Empleados" valor={estadisticas.empleados} icon={<FaUsers />} />
        <Card titulo="Asignaciones Activas" valor={estadisticas.asignacionesActivas} icon={<FaUserTie />} />
        <Card titulo="Solicitudes Totales" valor={estadisticas.totalSolicitudes} icon={<FaClipboardList />} />
      
        <Card titulo="Devoluciones" valor={estadisticas.totalDevoluciones} icon={<FaUndo />} />
        
      </div>

      <div className="chart-grid">
        <ChartBox titulo="Distribución de Equipos">
          <Doughnut
            data={{
              labels: ["Disponibles", "Asignados"],
              datasets: [{
                data: [estadisticas.disponibles, estadisticas.asignados],
                backgroundColor: ["#6366f1", "#a78bfa"],
                borderColor: "#1f2937",
                borderWidth: 4,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } },
            }}
          />
        </ChartBox>

        <ChartBox titulo="Asignaciones por Mes">
          <Bar data={{
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            datasets: [{ label: "Asignaciones", data: asignacionesPorMes, backgroundColor: "#8b5cf6", borderRadius: 5 }],
          }} options={opcionesGenerales} />
        </ChartBox>

        

        <ChartBox titulo="Solicitudes por Estado">
          <Doughnut data={{
            labels: Object.keys(solicitudesPorEstado),
            datasets: [{
              data: Object.values(solicitudesPorEstado),
              backgroundColor: ["#facc15", "#34d399", "#f87171"],
              borderColor: "#1f2937",
              borderWidth: 4,
            }],
          }} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } },
          }} />
        </ChartBox>

        <ChartBox titulo="Equipos por Tipo">
          <Bar data={{
            labels: Object.keys(equiposPorTipo),
            datasets: [{ label: "Equipos", data: Object.values(equiposPorTipo), backgroundColor: "#a78bfa", borderRadius: 5 }],
          }} options={opcionesGenerales} />
        </ChartBox>

        <ChartBox titulo="Equipos por Sede">
          <Bar data={{
            labels: Object.keys(equiposPorSede),
            datasets: [{ label: "Equipos", data: Object.values(equiposPorSede), backgroundColor: "#6366f1", borderRadius: 5 }],
          }} options={opcionesGenerales} />
        </ChartBox>

        <ChartBox titulo="Equipos por Área">
          <Bar data={{
            labels: Object.keys(equiposPorArea),
            datasets: [{ label: "Equipos", data: Object.values(equiposPorArea), backgroundColor: "#10b981", borderRadius: 5 }],
          }} options={opcionesGenerales} />
        </ChartBox>
      </div>
    </div>
  );
};

const Card = ({ titulo, valor, icon }) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{titulo}</h3>
      <div className="card-icon">{icon}</div>
    </div>
    <p className="card-value">{valor}</p>
  </div>
);

export default Drrhh;
