import { useState } from "react";
import CarScene from "./CarScene.jsx";

export default function Log() {
  const [hover, setHover] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 3D a la izquierda, login a la derecha */}
      <CarScene zoom={hover} side="left" />

      <div
        style={{ flex: 1, display: "grid", placeItems: "center", background: "#111" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Iniciar Sesión</h2>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Ingresar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
