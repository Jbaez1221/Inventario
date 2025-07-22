// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axiosBackend from "../api/axios";

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalEquipos: 0,
    disponibles: 0,
    asignados: 0,
    empleados: 0,
    asignacionesActivas: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [resEquipos, resEmpleados, resAsignaciones] = await Promise.all([
        axiosBackend.get("/equipos"),
        axiosBackend.get("/empleados"),
        axiosBackend.get("/asignaciones"),
      ]);

      const totalEquipos = resEquipos.data.length;
      const disponibles = resEquipos.data.filter((e) => e.estado === "Disponible").length;
      const asignados = totalEquipos - disponibles;
      const empleados = resEmpleados.data.length;
      const asignacionesActivas = resAsignaciones.data.filter((a) => !a.fecha_devolucion).length;

      setEstadisticas({
        totalEquipos,
        disponibles,
        asignados,
        empleados,
        asignacionesActivas,
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card titulo="Total Equipos" valor={estadisticas.totalEquipos} color="bg-blue-600" />
        <Card titulo="Disponibles" valor={estadisticas.disponibles} color="bg-green-600" />
        <Card titulo="Asignados" valor={estadisticas.asignados} color="bg-yellow-500" />
        <Card titulo="Empleados" valor={estadisticas.empleados} color="bg-purple-600" />
        <Card titulo="Asignaciones Activas" valor={estadisticas.asignacionesActivas} color="bg-red-600" />
      </div>
    </div>
  );
};

const Card = ({ titulo, valor, color }) => (
  <div className={`p-6 rounded shadow ${color}`}>
    <h3 className="text-xl font-semibold">{titulo}</h3>
    <p className="text-3xl font-bold">{valor}</p>
  </div>
);

export default Dashboard;
