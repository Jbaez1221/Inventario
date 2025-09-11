import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axiosBackend from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axiosBackend.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch {
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      delete axiosBackend.defaults.headers.common["Authorization"];
      setUser(null);
    }

    const responseInterceptor = axiosBackend.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosBackend.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout]);

  const login = async (credentials) => {
    try {
      const response = await axiosBackend.post("/auth/login", credentials);
      setToken(response.data.token);
      navigate("/home");
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
