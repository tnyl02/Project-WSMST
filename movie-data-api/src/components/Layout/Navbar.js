import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn, currentPlan }) => {
  const navigate = useNavigate(); // ← เพิ่ม useNavigate เพื่อใช้ในการเปลี่ยนหน้า
  // map plan → label
  const planLabel = {
    starter: 'free',
    developer: 'medium',
    enterprise: 'premium',
  };
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);


  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ส่วน Logo */}
        <div className="logo-section">
  <Link to="/" className="logo">LOGO</Link>
  {localStorage.getItem('role') === 'admin' && (
    <span className="admin-badge">Admin</span>
  )}
  <div className="divider"></div>
</div>

        {/* ส่วนเมนูตรงกลาง */}
        <ul className="nav-menu">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/docs" className={location.pathname === '/docs' ? 'active' : ''}>
              API Docs
            </Link>
          </li>
          <li>
            <Link to="/explorer" className={location.pathname === '/explorer' ? 'active' : ''}>
              Movie explorer
            </Link>
          </li>
        </ul>

        <div className="auth-section">
          {isLoggedIn ? (
            <div className="profile-container">
              {/* Badge สถานะ Free */}
              <div className={`status-badge badge-${currentPlan}`}>
                {planLabel[currentPlan] || 'free'}
              </div>

              {/* ส่วนที่กดแล้วจะเปิด Dropdown */}
              <div
                className="profile-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {/* สลับชื่อไว้หน้า รูปไว้หลัง ตามรูปที่คุณส่งมา */}

                <div className="user-avatar">NK</div>
                <span className="user-name">Narun K. <small>∨</small></span>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <span className="icon">○</span> My profile
                  </Link>
                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      setIsLoggedIn(false);
                      localStorage.removeItem('isLoggedIn');
                      setShowDropdown(false);
                      navigate('/'); // ← เพิ่ม redirect ไปหน้า Home
                    }}
                  >
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