import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Sidebar.css'; // อย่าลืมสร้างไฟล์ CSS สำหรับ Sidebar ด้วยนะครับ

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // สร้างโครงสร้างเมนูแบบแบ่งกลุ่ม
  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: '⬡' }, // เว้นที่ไว้ใส่ไอคอน
        { name: 'API management', path: '/api-management', icon: '◇' },
        { name: 'Usage logs', path: '/logs', icon: '≡' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { name: 'Documentation', path: '/docs', icon: '⊞' },
        { name: 'Subscription', path: '/subscription', icon: '◈' }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'My profile', path: '/profile', icon: '○' }
      ]
    }
  ];

  return (
    <aside className="sidebar">
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