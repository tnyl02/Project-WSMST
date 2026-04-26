import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role'); // ← ดึง role

  // เมนูสำหรับ Admin
  const adminMenuGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard',        path: '/admin/dashboard',        icon: '⬡' },
        { name: 'User management',  path: '/admin/user-management',  icon: '◇' },
        { name: 'Movie management', path: '/admin/movie-management', icon: '≡' }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'My profile', path: '/profile', icon: '○' }
      ]
    }
  ];

  // เมนูสำหรับ User ทั่วไป (เหมือนเดิม)
  const userMenuGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard',      path: '/dashboard',      icon: '⬡' },
        { name: 'API management', path: '/api-management', icon: '◇' },
        { name: 'Usage logs',     path: '/logs',           icon: '≡' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { name: 'Documentation', path: '/docs',         icon: '⊞' },
        { name: 'Subscription',  path: '/subscription', icon: '◈' }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'My profile', path: '/profile', icon: '○' }
      ]
    }
  ];

  // เลือกเมนูตาม role
  const menuGroups = role === 'admin' ? adminMenuGroups : userMenuGroups;

  return (
    <aside className="app-sidebar">
    

      <nav className="sidebar-nav">
        {menuGroups.map((group, gIndex) => (
          <div key={gIndex} className="sidebar-group">
            <h3 className="group-title">{group.title}</h3>
            {group.items.map((item) => (
              <div
                key={item.name}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;