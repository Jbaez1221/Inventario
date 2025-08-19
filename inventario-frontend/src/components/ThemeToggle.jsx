import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;
    
    root.removeAttribute('data-theme');
    body.classList.remove('theme-light', 'theme-dark');
    
    root.setAttribute('data-theme', theme);
    body.classList.add(`theme-${theme}`);
    
    root.style.colorScheme = theme;
    
    console.log(`Tema aplicado: ${theme}`, {
      dataTheme: root.getAttribute('data-theme'),
      bodyClass: body.className,
      colorScheme: root.style.colorScheme
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme;
    if (savedTheme) {
      initialTheme = savedTheme;
    } else {
      initialTheme = prefersDark ? 'dark' : 'light';
    }
    
    setIsDark(initialTheme === 'dark');
    applyTheme(initialTheme);
    localStorage.setItem('theme', initialTheme);
    
    console.log(`Tema inicial: ${initialTheme}`);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    console.log(`Cambiando de ${isDark ? 'dark' : 'light'} a ${newTheme}`);
    
    setIsDark(!isDark);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    setTimeout(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      console.log(`Verificación: tema actual es ${currentTheme}`);
    }, 100);
  };

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeToggle;
