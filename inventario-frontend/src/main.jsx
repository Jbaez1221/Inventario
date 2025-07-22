// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css'; // ⬅️ Importa el archivo CSS global
import './Equipos.css';
import './Asignaciones.css';
import "./Empleados.css";
import "./HistorialEquipo.css";




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
