import { useState } from "react";
import CarScene from "./CarScene.jsx";
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-corasur.png';
import styles from './log.module.css'

export default function Log() {
  const [hover, setHover] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ username, password });
      navigate("/home");
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al iniciar sesión. Intente nuevamente.");
      }
    }
  };


  return (
    <>
      {/* Fondo 3D a pantalla completa */}
      <CarScene zoom={hover} side="right" />

      {/* Overlay con el login */}
      <div className={styles.overlay}>
        
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <img src={logo} alt="Corasur Logo" className="sidebar-logo" />
          {error && ( 
            <div className={styles.error}>
              {error}
            </div>
          )}
          <input
            className={styles.input}
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.button} type="submit">Ingresar</button>
        </form>
      </div>
    </>
  );
}
