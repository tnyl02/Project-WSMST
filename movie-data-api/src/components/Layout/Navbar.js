import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import '../../styles/Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // ดึงข้อมูลจาก localStorage
  const username = localStorage.getItem('username') || 'User';
  const currentPlan = localStorage.getItem('plan') || 'free';
  const role = localStorage.getItem('role');

  // สร้างชื่อย่อ (Initials) จาก Username
  const initials = username.slice(0, 2).toUpperCase();

  // map plan → label (ให้ตรงกับ Badge CSS)
  const planLabel = {
    free: 'free',
    medium: 'medium',
    premium: 'premium',
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear(); 
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <img src={logoImg} alt="Movie API Logo" style={{ height: '65px', marginLeft: '-140px' }} />
          </Link>
          {role === 'admin' && <span className="admin-badge">Admin</span>}
          <div className="divider"></div>
        </div>

        <ul className="nav-menu">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/docs" className={location.pathname === '/docs' ? 'active' : ''}>API Docs</Link></li>
          <li><Link to="/explorer" className={location.pathname === '/explorer' ? 'active' : ''}>Movie explorer</Link></li>
        </ul>

        <div className="auth-section">
          {isLoggedIn ? (
            <div className="profile-container">
             
              <div className={`status-badge badge-${currentPlan}`}>
                {planLabel[currentPlan] || 'free'}
              </div>

              <div className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
               
                <div className="user-avatar">{initials}</div>
                <span className="user-name">{username} <small>∨</small></span>
              </div>

              {showDropdown && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <span className="icon">○</span> My profile
                  </Link>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Log in</Link>
              <Link to="/register" className="btn-signup">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;