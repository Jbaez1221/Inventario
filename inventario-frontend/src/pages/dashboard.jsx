import { useEffect, useState, useCallback } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const res = await axiosBackend.get("/dashboard/estadisticas");
      setEstadisticas(res.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  if (!estadisticas) {
    return <div>Cargando estadísticas...</div>;
  }

  const {
    totalEquipos,
    disponibles,
    asignados,
    empleados,
    asignacionesActivas,
    asignacionesPorMes,
    equiposPorSede,
    equiposPorTipo,
  } = estadisticas;

  const opcionesGenerales = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "#333" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#fff" },
        grid: { color: "#333" },
      },
    },
  };

  const dataDoughnut = {
    labels: ["Disponibles", "Asignados"],
    datasets: [
      {
        data: [disponibles, asignados],
        backgroundColor: ["#10B981", "#F59E0B"],
        borderColor: "#1f1f1f",
        borderWidth: 5,
      },
    ],
  };

  const dataBarMeses = {
    labels: [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ],
    datasets: [
      {
        label: "Asignaciones por mes",
        data: asignacionesPorMes,
        backgroundColor: "#3B82F6",
        borderRadius: 5,
      },
    ],
  };

  const dataPorSede = {
    labels: Object.keys(equiposPorSede),
    datasets: [
      {
        label: "Equipos por Sede",
        data: Object.values(equiposPorSede),
        backgroundColor: "#22d3ee",
        borderRadius: 5,
      },
    ],
  };

  const dataPorTipo = {
    labels: Object.keys(equiposPorTipo),
    datasets: [
      {
        label: "Equipos por Tipo",
        data: Object.values(equiposPorTipo),
        backgroundColor: "#a78bfa",
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="tarjetas-grid">
        <Card titulo="Total Equipos" valor={totalEquipos} icon={<FaLaptop />} />
        <Card titulo="Disponibles" valor={disponibles} icon={<FaCheckCircle />} />
        <Card titulo="Asignados" valor={asignados} icon={<FaClipboardList />} />
        <Card titulo="Empleados" valor={empleados} icon={<FaUsers />} />
        <Card titulo="Asignaciones Activas" valor={asignacionesActivas} icon={<FaUserTie />} />
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h2 className="chart-title">Distribución de Equipos</h2>
          <div className="doughnut-container">
            <Doughnut data={dataDoughnut} />
          </div>
        </div>
        <div className="chart-box">
          <h2 className="chart-title">Asignaciones por Mes</h2>
          <Bar data={dataBarMeses} options={opcionesGenerales} />
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: "40px" }}>
        <div className="chart-box">
          <h2 className="chart-title">Equipos por Sede</h2>
          <Bar data={dataPorSede} options={opcionesGenerales} />
        </div>
        <div className="chart-box">
          <h2 className="chart-title">Equipos por Tipo</h2>
          <Bar data={dataPorTipo} options={opcionesGenerales} />
        </div>
      </div>
    </div>
  );
};

const Card = ({ titulo, valor, icon }) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{titulo}</h3>
      <div className="text-2xl">{icon}</div>
    </div>
    <p className="card-value">{valor}</p>
  </div>
);

export default Dashboard;
