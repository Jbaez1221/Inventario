import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo-corasur.png';

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isLoginModalOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
    } catch {
      // El error ya se maneja en el AuthProvider
    }
  };

  return (
    <div className="modal-overlay" onClick={closeLoginModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={closeLoginModal}>&times;</button>
        <img src={logo} alt="Logo de la Empresa" className="login-logo" />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
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
  );
};

export default LoginModal;