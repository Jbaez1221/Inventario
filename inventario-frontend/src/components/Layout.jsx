import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import LoginModal from './LoginModal';
import { useAuth } from '../hooks/useAuth';
import { FaBars } from 'react-icons/fa';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const { isLoginModalOpen } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  }, [location]);
  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-visible' : ''}`}>
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="mobile-overlay" onClick={closeSidebar}></div>
      )}

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      
      <main className="content-area">
        <button className="mobile-menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <Outlet />
      </main>
      {isLoginModalOpen && <LoginModal />}
    </div>
  );
};

export default Layout;