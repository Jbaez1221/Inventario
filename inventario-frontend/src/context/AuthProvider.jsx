import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import axiosBackend from '../api/axios';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const logout = () => {
    setToken(null);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axiosBackend.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axiosBackend.defaults.headers.common['Authorization'];
    }

    const responseInterceptor = axiosBackend.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log("Token expirado o inválido. Cerrando sesión.");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosBackend.interceptors.response.eject(responseInterceptor);
    };

  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await axiosBackend.post('/auth/login', credentials);
      setToken(response.data.token);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Error de login:', error);
      alert('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
      throw error;
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};