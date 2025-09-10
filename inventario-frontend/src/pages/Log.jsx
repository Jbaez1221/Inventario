import { useState } from "react";
import CarScene from "./CarScene.jsx";
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
      <div style={styles.overlay}>
        <form
          style={styles.form}
          onSubmit={handleSubmit}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <h2 style={styles.title}>Iniciar Sesión</h2>
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
          <input
            style={styles.input}
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Ingresar</button>
        </form>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "36vw",
    minWidth: 320,
    maxWidth: 520,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    zIndex: 2,
    background: "linear-gradient(90deg, rgba(11,18,32,0.85), rgba(11,18,32,0.35) 70%, transparent)",
  },
  form: {
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "2rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(4px)",
  },
  title: { margin: 0, textAlign: "center", color: "#fff" },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "1px solid #334155",
    outline: "none",
    fontSize: 16,
    background: "#0b1220",
    color: "#fff",
  },
  button: {
    padding: "0.75rem 1rem",
    borderRadius: 8,
    border: "none",
    fontSize: 16,
    cursor: "pointer",
  },
  error: {
    color: "#ffffffff"
  }
};
