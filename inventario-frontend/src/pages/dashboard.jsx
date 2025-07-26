import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";
import {
  FaLaptop,
  FaCheckCircle,
  FaUserTie,
  FaUsers,
  FaClipboardList,
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

import "../App.css";

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalEquipos: 0,
    disponibles: 0,
    asignados: 0,
    empleados: 0,
    asignacionesActivas: 0,
  });

  const [asignacionesPorMes, setAsignacionesPorMes] = useState([]);
  const [equiposPorSede, setEquiposPorSede] = useState({});
  const [equiposPorTipo, setEquiposPorTipo] = useState({});
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
      const [resEquipos, resEmpleados, resAsignaciones] = await Promise.all([
        axiosBackend.get("/equipos"),
        axiosBackend.get("/empleados"),
        axiosBackend.get("/asignaciones"),
      ]);

      const equipos = resEquipos.data;
      const asignaciones = resAsignaciones.data;

      const totalEquipos = equipos.length;
      const disponibles = equipos.filter((e) => e.estado === "Disponible").length;
      const asignados = totalEquipos - disponibles;
      const empleados = resEmpleados.data.length;
      const asignacionesActivas = asignaciones.filter((a) => !a.fecha_devolucion).length;

      const asignacionesFiltradas = asignaciones.filter((a) =>
        dentroDelRango(a.fecha_entrega)
      );
      const equiposFiltrados = equipos.filter((e) =>
        dentroDelRango(e.fecha_ingreso)
      );

      const asignacionesMes = Array(12).fill(0);
      asignacionesFiltradas.forEach((a) => {
        const fecha = new Date(a.fecha_entrega);
        const mes = fecha.getMonth();
        asignacionesMes[mes]++;
      });

      setEstadisticas({
        totalEquipos,
        disponibles,
        asignados,
        empleados,
        asignacionesActivas,
      });

      setAsignacionesPorMes(asignacionesMes);
      setEquiposPorSede(contarPorCampo(equiposFiltrados, "ubicacion"));
      setEquiposPorTipo(contarPorCampo(equiposFiltrados, "tipo"));
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

  const dataDoughnut = {
    labels: ["Disponibles", "Asignados"],
    datasets: [{
      data: [estadisticas.disponibles, estadisticas.asignados],
      backgroundColor: ["#6366f1", "#a78bfa"],
      borderColor: "#1f2937",
      borderWidth: 4,
    }],
  };

  const dataBarMeses = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [{
      label: "Asignaciones por mes",
      data: asignacionesPorMes,
      backgroundColor: "#8b5cf6",
      borderRadius: 5,
    }],
  };

  const dataPorSede = {
    labels: Object.keys(equiposPorSede),
    datasets: [{
      label: "Equipos por Sede",
      data: Object.values(equiposPorSede),
      backgroundColor: "#6366f1",
      borderRadius: 5,
    }],
  };

  const dataPorTipo = {
    labels: Object.keys(equiposPorTipo),
    datasets: [{
      label: "Equipos por Tipo",
      data: Object.values(equiposPorTipo),
      backgroundColor: "#a78bfa",
      borderRadius: 5,
    }],
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Aquí están los detalles analíticos.</p>
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
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h2 className="chart-title">Distribución de Equipos</h2>
          <div className="chart-container doughnut-container">
            <Doughnut data={dataDoughnut} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } } }} />
          </div>
        </div>
        <div className="chart-box">
          <h2 className="chart-title">Asignaciones por Mes</h2>
          <div className="chart-container">
            <Bar data={dataBarMeses} options={opcionesGenerales} />
          </div>
        </div>
        <div className="chart-box">
          <h2 className="chart-title">Equipos por Sede</h2>
          <div className="chart-container">
            <Bar data={dataPorSede} options={opcionesGenerales} />
          </div>
        </div>
        <div className="chart-box">
          <h2 className="chart-title">Equipos por Tipo</h2>
          <div className="chart-container">
            <Bar data={dataPorTipo} options={opcionesGenerales} />
          </div>
        </div>
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

export default Dashboard;
